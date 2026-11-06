package essentials

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
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
	authValidateURL      = "http://localhost:8080/validate"
	authHTTPClient       = &http.Client{Timeout: 5 * time.Second}
	authValidateEnabled  = true
	validateServiceError = "validate service error"
)

// logValidateFailure records an EdDSA-island /validate failure.
// Callers must not put this detail into an HTTP response.
func logValidateFailure(req ValidateRequest, format string, args ...any) {
	log.Printf("eddsa-island validate error op=%s user_id=%s: %s", req.OperationCode, req.UserID, fmt.Sprintf(format, args...))
}

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
		logValidateFailure(req, "marshal request: %v", err)
		return nil, eris.New(validateServiceError)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, authValidateURL, bytes.NewReader(payload))
	if err != nil {
		logValidateFailure(req, "new request: %v", err)
		return nil, eris.New(validateServiceError)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := authHTTPClient.Do(httpReq)
	if err != nil {
		logValidateFailure(req, "call: %v", err)
		return nil, eris.New(validateServiceError)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logValidateFailure(req, "read response: %v", err)
		return nil, eris.New(validateServiceError)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		logValidateFailure(req, "HTTP %d: %s", resp.StatusCode, string(body))
		return nil, eris.New(validateServiceError)
	}

	var out ValidateResponse
	if err := json.Unmarshal(body, &out); err != nil {
		logValidateFailure(req, "decode response: %v body=%s", err, string(body))
		return nil, eris.New(validateServiceError)
	}
	return &out, nil
}

// ExtractAccessToken reads bearer token from Authorization header or access_token cookie.
func ExtractAccessToken(ctx *app.RequestContext) string {
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

		token := ExtractAccessToken(ctx)
		userID := ExtractUserID(ctx)
		if token == "" || userID == "" {
			writeAuthError(ctx, http.StatusUnauthorized, "missing access_token or user_id")
			ctx.Abort()
			return
		}

		op := OperationCode(ctx)
		path := ctx.FullPath()
		if path == "" {
			path = string(ctx.Path())
		}
		// Permission probe: only require a valid token; per-op ACL is checked inside the handler.
		tokenOnly := path == "/api/business/check-operations"

		result, err := CallValidate(c, ValidateRequest{
			AccessToken:   token,
			UserID:        userID,
			OperationCode: op,
		})
		if err != nil {
			writeAuthError(ctx, http.StatusBadGateway, validateServiceError)
			ctx.Abort()
			return
		}
		if !result.Validated {
			writeAuthError(ctx, http.StatusUnauthorized, "token validation failed")
			ctx.Abort()
			return
		}
		if !tokenOnly && !result.Authorized {
			writeAuthError(ctx, http.StatusForbidden, "operation not authorized: "+op)
			ctx.Abort()
			return
		}

		ctx.Set("auth_sub", result.Sub)
		ctx.Set("auth_user_id", userID)
		ctx.Set("auth_access_token", token)
		ctx.Next(c)
	}
}
