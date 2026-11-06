package essentials

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"
)

const upstreamSecret = "upstream-secret-detail-xyz"

func withValidateServer(t *testing.T, handler http.HandlerFunc) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)

	prevURL := authValidateURL
	prevEnabled := authValidateEnabled
	authValidateURL = srv.URL
	authValidateEnabled = true
	t.Cleanup(func() {
		authValidateURL = prevURL
		authValidateEnabled = prevEnabled
	})
}

func captureLog(t *testing.T) *bytes.Buffer {
	t.Helper()
	var buf bytes.Buffer
	prev := log.Writer()
	log.SetOutput(&buf)
	t.Cleanup(func() { log.SetOutput(prev) })
	return &buf
}

func TestCallValidate_UpstreamErrorIsLoggedNotReturned(t *testing.T) {
	withValidateServer(t, func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, upstreamSecret, http.StatusInternalServerError)
	})
	logs := captureLog(t)

	_, err := CallValidate(context.Background(), ValidateRequest{
		AccessToken:   "token",
		UserID:        "user-1",
		OperationCode: "GET/api/business/customers",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if strings.Contains(err.Error(), upstreamSecret) {
		t.Fatalf("upstream body leaked in error: %v", err)
	}
	if !strings.Contains(logs.String(), upstreamSecret) {
		t.Fatalf("log missing upstream body: %q", logs.String())
	}
}

func TestCallValidate_TransportErrorIsLoggedNotReturned(t *testing.T) {
	prevURL := authValidateURL
	authValidateURL = "http://127.0.0.1:1"
	t.Cleanup(func() { authValidateURL = prevURL })
	logs := captureLog(t)

	_, err := CallValidate(context.Background(), ValidateRequest{
		AccessToken:   "token",
		UserID:        "user-1",
		OperationCode: "GET/api/business/customers",
	})
	if err == nil {
		t.Fatal("expected error")
	}
	if err.Error() != validateServiceError {
		t.Fatalf("error = %q", err.Error())
	}
	if !strings.Contains(logs.String(), "127.0.0.1:1") {
		t.Fatalf("log missing dial target: %q", logs.String())
	}
}

func TestAuthValidateMiddleware_DoesNotLeakUpstreamError(t *testing.T) {
	withValidateServer(t, func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, upstreamSecret, http.StatusBadGateway)
	})
	captureLog(t)

	ctx := app.NewContext(16)
	ctx.Request.Header.SetMethod(http.MethodGet)
	ctx.Request.SetRequestURI("/api/business/customers")
	ctx.Request.Header.Set("Authorization", "Bearer token")
	ctx.Request.Header.Set("X-User-Id", "user-1")

	AuthValidateMiddleware()(context.Background(), ctx)

	body := string(ctx.Response.Body())
	if strings.Contains(body, upstreamSecret) {
		t.Fatalf("upstream body leaked to client: %s", body)
	}
	if ctx.Response.StatusCode() != http.StatusBadGateway {
		t.Fatalf("status %d body %s", ctx.Response.StatusCode(), body)
	}
}
