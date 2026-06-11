package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func signedTestToken(t *testing.T, secret string, claims jwt.MapClaims) string {
	t.Helper()

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("sign test token: %v", err)
	}

	return token
}

func runRequireAuthRequest(t *testing.T, token string) *httptest.ResponseRecorder {
	t.Helper()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := UserFromContext(r.Context())
		if user == nil {
			t.Fatal("expected user in request context")
		}
		if user.ID != "user-123" {
			t.Fatalf("expected user ID user-123, got %q", user.ID)
		}

		w.WriteHeader(http.StatusNoContent)
	})

	request := httptest.NewRequest(http.MethodGet, "/protected", nil)
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}

	recorder := httptest.NewRecorder()
	RequireAuth()(next).ServeHTTP(recorder, request)

	return recorder
}

func TestRequireAuthAcceptsValidJWT(t *testing.T) {
	const secret = "test-secret"
	t.Setenv("SUPABASE_JWT_SECRET", secret)

	token := signedTestToken(t, secret, jwt.MapClaims{
		"sub":   "user-123",
		"email": "user@example.com",
		"role":  "authenticated",
		"exp":   time.Now().Add(time.Hour).Unix(),
	})

	recorder := runRequireAuthRequest(t, token)
	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}
}

func TestRequireAuthRejectsExpiredToken(t *testing.T) {
	const secret = "test-secret"
	t.Setenv("SUPABASE_JWT_SECRET", secret)

	token := signedTestToken(t, secret, jwt.MapClaims{
		"sub": "user-123",
		"exp": time.Now().Add(-time.Hour).Unix(),
	})

	recorder := runRequireAuthRequest(t, token)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestRequireAuthRejectsWrongSigningMethod(t *testing.T) {
	t.Setenv("SUPABASE_JWT_SECRET", "test-secret")

	token, err := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{
		"sub": "user-123",
		"exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		t.Fatalf("sign none-alg token: %v", err)
	}

	recorder := runRequireAuthRequest(t, token)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestRequireAuthRejectsMissingAuthorizationHeader(t *testing.T) {
	t.Setenv("SUPABASE_JWT_SECRET", "test-secret")

	recorder := runRequireAuthRequest(t, "")
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestRequireAuthRejectsMalformedToken(t *testing.T) {
	t.Setenv("SUPABASE_JWT_SECRET", "test-secret")

	request := httptest.NewRequest(http.MethodGet, "/protected", nil)
	request.Header.Set("Authorization", "Bearer not-a-jwt")

	recorder := httptest.NewRecorder()
	RequireAuth()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("next handler should not run for malformed token")
	})).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestRequireAuthRejectsMissingJWTSecret(t *testing.T) {
	t.Setenv("SUPABASE_JWT_SECRET", "")

	recorder := httptest.NewRecorder()
	RequireAuth()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("next handler should not run when the JWT secret is missing")
	})).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/protected", nil))

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
}

func TestRequireAuthRejectsMissingSubjectClaim(t *testing.T) {
	const secret = "test-secret"
	t.Setenv("SUPABASE_JWT_SECRET", secret)

	token := signedTestToken(t, secret, jwt.MapClaims{
		"email": "user@example.com",
		"role":  "authenticated",
		"exp":   time.Now().Add(time.Hour).Unix(),
	})

	recorder := runRequireAuthRequest(t, token)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}
