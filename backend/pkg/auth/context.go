package auth

import (
	"context"
)

// User represents the authenticated user's identity extracted from the Supabase JWT.
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// contextKey is an unexported type for context keys to prevent collisions.
type contextKey string

const userContextKey contextKey = "user"

// WithUser returns a new context with the authenticated User attached.
func WithUser(ctx context.Context, user *User) context.Context {
	return context.WithValue(ctx, userContextKey, user)
}

// UserFromContext retrieves the authenticated User from the context.
func UserFromContext(ctx context.Context) *User {
	user, ok := ctx.Value(userContextKey).(*User)
	if !ok {
		return nil
	}
	return user
}
