package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestRequestIDAddsHeaderAndContextValue(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID, ok := r.Context().Value("request_id").(string)
		if !ok || requestID == "" {
			t.Fatal("expected request_id in request context")
		}
		if headerID := w.Header().Get("X-Request-ID"); headerID != requestID {
			t.Fatalf("expected response header %q to match context %q", headerID, requestID)
		}

		w.WriteHeader(http.StatusNoContent)
	})

	recorder := httptest.NewRecorder()
	RequestID(next).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}
	if recorder.Header().Get("X-Request-ID") == "" {
		t.Fatal("expected X-Request-ID header to be set")
	}
}

func TestRecoveryCatchesPanics(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("boom")
	})

	recorder := httptest.NewRecorder()
	Recovery(next).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
	if body := recorder.Body.String(); !strings.Contains(body, "internal server error") {
		t.Fatalf("expected internal server error body, got %q", body)
	}
}

func TestTimeoutCancelsLongRequests(t *testing.T) {
	contextDone := make(chan struct{})
	release := make(chan struct{})

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-r.Context().Done()
		close(contextDone)
		<-release
	})

	recorder := httptest.NewRecorder()
	Timeout(5*time.Millisecond)(next).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))
	close(release)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status %d, got %d", http.StatusServiceUnavailable, recorder.Code)
	}
	if body := recorder.Body.String(); !strings.Contains(body, "request timeout") {
		t.Fatalf("expected timeout body, got %q", body)
	}

	select {
	case <-contextDone:
	case <-time.After(100 * time.Millisecond):
		t.Fatal("expected request context to be canceled")
	}
}

func TestCORSAddsHeadersAndContinuesNonOptionsRequests(t *testing.T) {
	t.Setenv("ALLOWED_ORIGINS", "https://draftdeckai.com, http://localhost:3000")
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusNoContent)
	})

	recorder := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "https://draftdeckai.com")
	CORS(next).ServeHTTP(recorder, req)

	if !nextCalled {
		t.Fatal("expected next handler to run")
	}
	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}
	if origin := recorder.Header().Get("Access-Control-Allow-Origin"); origin != "https://draftdeckai.com" {
		t.Fatalf("expected allowlisted origin, got %q", origin)
	}
	if methods := recorder.Header().Get("Access-Control-Allow-Methods"); !strings.Contains(methods, http.MethodPost) {
		t.Fatalf("expected allowed methods to include POST, got %q", methods)
	}
	if headers := recorder.Header().Get("Access-Control-Allow-Headers"); !strings.Contains(headers, "Authorization") {
		t.Fatalf("expected allowed headers to include Authorization, got %q", headers)
	}
	if vary := recorder.Header().Get("Vary"); !strings.Contains(vary, "Origin") {
		t.Fatalf("expected Vary to include Origin, got %q", vary)
	}
}

func TestCORSHandlesOptionsPreflight(t *testing.T) {
	t.Setenv("ALLOWED_ORIGINS", "https://draftdeckai.com")
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("next handler should not run for OPTIONS preflight")
	})

	recorder := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "https://draftdeckai.com")
	CORS(next).ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
	if origin := recorder.Header().Get("Access-Control-Allow-Origin"); origin != "https://draftdeckai.com" {
		t.Fatalf("expected allowlisted origin, got %q", origin)
	}
	if vary := recorder.Header().Get("Vary"); !strings.Contains(vary, "Origin") {
		t.Fatalf("expected Vary to include Origin, got %q", vary)
	}
}
