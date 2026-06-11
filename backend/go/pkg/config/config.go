package config

import (
	"fmt"
	"log/slog"
	"os"
	"strings"
)

var requiredEnvVars = []string{
	"SUPABASE_JWT_SECRET",
	"DATABASE_URL",
}

// ValidateEnv checks that all required environment variables are set.
func ValidateEnv() error {
	var missing []string
	for _, key := range requiredEnvVars {
		if os.Getenv(key) == "" {
			missing = append(missing, key)
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}
	return nil
}

// PrintStartupSummary logs the startup configuration summary with masked secrets.
func PrintStartupSummary() {
	slog.Info("Startup Configuration Summary:")
	for _, key := range requiredEnvVars {
		val := os.Getenv(key)
		masked := MaskSecret(val)
		slog.Info(fmt.Sprintf("  %s: %s", key, masked))
	}
}

// MaskSecret masks sensitive values for logging.
func MaskSecret(secret string) string {
	if len(secret) <= 8 {
		return "********"
	}
	return secret[:4] + "..." + secret[len(secret)-4:]
}
