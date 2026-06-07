// Package config provides environment variable validation and configuration
// loading for the DraftDeckAI Go backend.
package config

import (
	"fmt"
	"log"
	"os"
	"strings"
)

// EnvVar describes a single environment variable — whether it is required,
// its default value (for optional vars), and a short description shown at
// startup.
type EnvVar struct {
	Name        string
	Required    bool
	Default     string
	Description string
	Secret      bool // if true, mask value in startup log
}

// requiredVars lists every variable the server needs to operate correctly.
var envVars = []EnvVar{
	{
		Name:        "SUPABASE_JWT_SECRET",
		Required:    true,
		Description: "JWT secret used to verify Supabase auth tokens",
		Secret:      true,
	},
	{
		Name:        "SUPABASE_URL",
		Required:    true,
		Description: "Base URL of your Supabase project",
		Secret:      false,
	},
	{
		Name:        "PORT",
		Required:    false,
		Default:     "8080",
		Description: "HTTP port the server listens on",
		Secret:      false,
	},
	{
		Name:        "DATABASE_URL",
		Required:    false,
		Default:     "",
		Description: "Postgres connection string (future use)",
		Secret:      true,
	},
}

// maskSecret returns a partially masked string for secret values.
// e.g. "abcdefghij" -> "abc...hij"
func maskSecret(value string) string {
	if len(value) <= 6 {
		return "***"
	}
	return value[:3] + "..." + value[len(value)-3:]
}

// ValidateEnv checks that all required environment variables are set.
// It logs every missing variable before returning an error so operators
// see all problems at once instead of fixing one at a time.
// Optional variables are set to their default when absent.
func ValidateEnv() error {
	var missing []string

	for _, v := range envVars {
		val := os.Getenv(v.Name)

		if val == "" {
			if v.Required {
				missing = append(missing, v.Name)
			} else if v.Default != "" {
				// Apply default for optional vars
				if err := os.Setenv(v.Name, v.Default); err != nil {
					log.Printf("[config] warning: could not set default for %s: %v", v.Name, err)
				}
			}
		}
	}

	if len(missing) > 0 {
		return fmt.Errorf(
			"server startup aborted — missing required environment variables: %s\n"+
				"Set them in your .env file or shell environment before starting.",
			strings.Join(missing, ", "),
		)
	}

	return nil
}

// PrintStartupSummary logs a human-readable summary of all env vars,
// masking secrets so they never appear in plain text in logs.
func PrintStartupSummary() {
	log.Println("[config] Environment variable summary:")
	for _, v := range envVars {
		val := os.Getenv(v.Name)

		display := val
		if display == "" {
			display = "(not set)"
		} else if v.Secret {
			display = maskSecret(val)
		}

		status := "optional"
		if v.Required {
			status = "required"
		}

		log.Printf("[config]   %-30s = %-20s  [%s] %s",
			v.Name, display, status, v.Description)
	}
}