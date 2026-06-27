package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// ErrorResponse represents a standard JSON error returned by the API.
type ErrorResponse struct {
	Error string `json:"error"`
}

// writeError Helper to write JSON error responses.
func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}

// RequireAuth verifies the Supabase JWT Bearer token, extracts
// user claims, and attaches them to the request context.
// Returns a middleware that returns 401 if the token is missing or invalid.
func RequireAuth() func(http.Handler) http.Handler {
	jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if jwtSecret == "" {
		return func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				writeError(w, http.StatusInternalServerError, "Server configuration error: JWT secret not set")
			})
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeError(w, http.StatusUnauthorized, "Authorization header is missing")
				return
			}

			// Extract the Bearer token
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				writeError(w, http.StatusUnauthorized, "Invalid authorization header format. Expected 'Bearer <token>'")
				return
			}
			tokenString := parts[1]

			// Parse and verify the JWT
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// Supabase uses HS256 for signing JWTs
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				var errMsg string
				if errors.Is(err, jwt.ErrTokenExpired) {
					errMsg = "Token has expired"
				} else {
					errMsg = "Invalid token"
				}
				writeError(w, http.StatusUnauthorized, errMsg)
				return
			}

			// Extract claims
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				writeError(w, http.StatusUnauthorized, "Invalid token claims")
				return
			}

			// Construct User object from Supabase JWT claims
			user := &User{}
			if sub, ok := claims["sub"].(string); ok {
				user.ID = sub
			} else {
				writeError(w, http.StatusUnauthorized, "Missing subject (user ID) in token")
				return
			}

			if email, ok := claims["email"].(string); ok {
				user.Email = email
			}
			if role, ok := claims["role"].(string); ok {
				user.Role = role
			}

			// Attach user to context and call the next handler
			ctx := WithUser(r.Context(), user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
