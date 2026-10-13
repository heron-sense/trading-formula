package essentials

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/rotisserie/eris"
)

const (
	headerUserID = "X-User-Id"
)

// ValidateRequest matches EdDSA-island /validate body.
type ValidateRequest struct {
	AccessToken   string `json:"access_token"`
	UserID        string `json:"user_id"`
	OperationCode string `json:"operation_code"`
}

// ValidateResponse matches EdDSA-island /validate response.
type ValidateResponse struct {
	Sub        string `json:"sub"`
	Iat        int64  `json:"iat"`
	Exp        int64  `json:"exp"`
	Authorized bool   `json:"authorized"`
	Validated  bool   `json:"validated"`
}

var (
	authValidateURL     = "http://localhost:8080/validate"
	authHTTPClient      = &http.Client{Timeout: 5 * time.Second}
	authValidateEnabled = true
)

// ConfigureAuthValidate sets the remote validate endpoint.
func ConfigureAuthValidate(validateURL string, enabled bool) {
	if strings.TrimSpace(validateURL) != "" {
		authValidateURL = strings.TrimSpace(validateURL)
	}
	authValidateEnabled = enabled
}

// CallValidate posts to EdDSA-island /validate.
func CallValidate(ctx context.Context, req ValidateRequest) (*ValidateResponse, error) {
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, eris.Wrap(err, "marshal validate request")
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, authValidateURL, bytes.NewReader(payload))
	if err != nil {
		return nil, eris.Wrap(err, "new validate request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := authHTTPClient.Do(httpReq)
	if err != nil {
		return nil, eris.Wrap(err, "call validate")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, eris.Wrap(err, "read validate response")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, eris.Errorf("validate HTTP %d: %s", resp.StatusCode, string(body))
	}

	var out ValidateResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, eris.Wrap(err, "decode validate response")
	}
	return &out, nil
}

func extractAccessToken(ctx *app.RequestContext) string {
	auth := string(ctx.GetHeader("Authorization"))
	if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return strings.TrimSpace(auth[7:])
	}
	if cookie := string(ctx.Cookie("access_token")); strings.TrimSpace(cookie) != "" {
		return cookie
	}
	return ""
}

// ExtractUserID reads user id from X-User-Id header or user_id cookie.
func ExtractUserID(ctx *app.RequestContext) string {
	if id := strings.TrimSpace(string(ctx.GetHeader(headerUserID))); id != "" {
		return id
	}
	if cookie := strings.TrimSpace(string(ctx.Cookie("user_id"))); cookie != "" {
		return cookie
	}
	return ""
}

// OperationCode = HTTP method + url-path (route pattern preferred).
func OperationCode(ctx *app.RequestContext) string {
	method := strings.ToUpper(string(ctx.Method()))
	path := ctx.FullPath()
	if path == "" {
		path = string(ctx.Path())
	}
	return method + path
}

func writeAuthError(ctx *app.RequestContext, status int, message string) {
	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-Id")
	ctx.JSON(status, map[string]any{
		"success": false,
		"message": message,
	})
}

// AuthValidateMiddleware calls EdDSA /validate for every non-OPTIONS API request.
func AuthValidateMiddleware() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		if !authValidateEnabled {
			ctx.Next(c)
			return
		}

		method := strings.ToUpper(string(ctx.Method()))
		if method == http.MethodOptions {
			ctx.Next(c)
			return
		}

		token := extractAccessToken(ctx)
		userID := ExtractUserID(ctx)
		if token == "" || userID == "" {
			writeAuthError(ctx, http.StatusUnauthorized, "missing access_token or user_id")
			ctx.Abort()
			return
		}

		op := OperationCode(ctx)
		result, err := CallValidate(c, ValidateRequest{
			AccessToken:   token,
			UserID:        userID,
			OperationCode: op,
		})
		if err != nil {
			writeAuthError(ctx, http.StatusBadGateway, fmt.Sprintf("validate service error: %v", err))
			ctx.Abort()
			return
		}
		if !result.Validated {
			writeAuthError(ctx, http.StatusUnauthorized, "token validation failed")
			ctx.Abort()
			return
		}
		if !result.Authorized {
			writeAuthError(ctx, http.StatusForbidden, "operation not authorized: "+op)
			ctx.Abort()
			return
		}

		ctx.Set("auth_sub", result.Sub)
		ctx.Set("auth_user_id", userID)
		ctx.Next(c)
	}
}
