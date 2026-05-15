package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/ItsAbir005/Draftdeckai/backend/pkg/auth"
)

func main() {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Public routes
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "Draftdeckai Go Backend"})
	})

	// Protected API routes
	r.Route("/api", func(r chi.Router) {
		// Mount the Supabase JWT Authentication middleware
		r.Use(auth.RequireAuth())

		// Example protected endpoint
		r.Get("/user", func(w http.ResponseWriter, r *http.Request) {
			// Extract the verified user from the context
			user := auth.UserFromContext(r.Context())
			if user == nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "Failed to retrieve user from context"})
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			// Return the verified user details
			json.NewEncoder(w).Encode(map[string]interface{}{
				"message": "Successfully authenticated",
				"user":    user,
			})
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
