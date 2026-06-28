package utils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteJSONErrorWritesStatusAndBody(t *testing.T) {
	recorder := httptest.NewRecorder()

	WriteJSONError(recorder, http.StatusBadRequest, "invalid payload")

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
	if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
		t.Fatalf("expected application/json content type, got %q", contentType)
	}

	var response ErrorResponse
	if err := json.NewDecoder(recorder.Body).Decode(&response); err != nil {
		t.Fatalf("decode response body: %v", err)
	}

	if response.Error != http.StatusText(http.StatusBadRequest) {
		t.Fatalf("expected error %q, got %q", http.StatusText(http.StatusBadRequest), response.Error)
	}
	if response.Message != "invalid payload" {
		t.Fatalf("expected message %q, got %q", "invalid payload", response.Message)
	}
	if response.Status != http.StatusBadRequest {
		t.Fatalf("expected response status %d, got %d", http.StatusBadRequest, response.Status)
	}
}
