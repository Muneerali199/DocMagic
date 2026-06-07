// Package main is the entry point for the DraftDeckAI Go backend server.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Muneerali199/Draftdeckai/backend/go/pkg/config"
)

func main() {
	log.Println("[server] Starting DraftDeckAI Go backend...")

	// Validate all required environment variables before doing anything else.
	// This will log ALL missing vars and exit with code 1 if any are absent.
	if err := config.ValidateEnv(); err != nil {
		log.Fatalf("[server] FATAL: %v", err)
	}

	// Print startup summary with secrets masked
	config.PrintStartupSummary()

	port := os.Getenv("PORT")

	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte(`{"status":"ok"}`)); err != nil {
			log.Printf("[server] health write error: %v", err)
		}
	})

	log.Printf("[server] Listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("[server] FATAL: %v", err)
	}
}