// Package auth provides JWT authentication middleware for the Go backend.
package auth

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates the Supabase JWT token in the Authorization header.
// Uses structured logging — JWT tokens are NEVER logged.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secret := os.Getenv("SUPABASE_JWT_SECRET")
		if secret == "" {
			slog.Error("auth middleware misconfigured",
				slog.String("reason", "SUPABASE_JWT_SECRET not set"),
				slog.String("path", r.URL.Path),
			)
			http.Error(w,"internal server error",
				
				http.StatusInternalServerError,
			)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			slog.Warn("auth failed: missing bearer token",
				slog.String("path", r.URL.Path),
				slog.String("remote_addr", r.RemoteAddr),
			)
			http.Error(w, "missing or invalid Authorization header", http.StatusUnauthorized)
			return
		}

		// NOTE: tokenStr is intentionally NOT logged to avoid leaking secrets
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			slog.Warn("auth failed: invalid token",
				slog.String("path", r.URL.Path),
				slog.String("remote_addr", r.RemoteAddr),
				slog.String("error", func() string {
    if err != nil {
        return err.Error()
    }
    return "token invalid"
}()),
			)
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		slog.Debug("auth successful",
			slog.String("path", r.URL.Path),
		)

		next.ServeHTTP(w, r)
	})
}