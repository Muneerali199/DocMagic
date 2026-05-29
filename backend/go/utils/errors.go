package utils

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Status  int    `json:"status"`
}

func WriteJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(status)

	response := ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
		Status:  status,
	}

	_ = json.NewEncoder(w).Encode(response)
}
