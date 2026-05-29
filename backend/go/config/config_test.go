package config

import (
	"os"
	"testing"
)

func TestGetEnvWithDefault(t *testing.T) {
	os.Unsetenv("NODE_ENV")

	value := getEnvWithDefault("NODE_ENV", "development")

	if value != "development" {
		t.Errorf("expected development, got %s", value)
	}
}
