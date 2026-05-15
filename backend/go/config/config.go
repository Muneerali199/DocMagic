package config

import (
	"fmt"
	"os"
)

type Config struct {
	DatabaseURL     string
	SupabaseURL     string
	SupabaseAnonKey string
	OpenAIAPIKey    string
	EmailFrom       string
	Environment     string
}

func Load() (*Config, error) {
	cfg := &Config{
		DatabaseURL:     getEnv("DATABASE_URL", true),
		SupabaseURL:     getEnv("NEXT_PUBLIC_SUPABASE_URL", true),
		SupabaseAnonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", true),
		OpenAIAPIKey:    getEnv("OPENAI_API_KEY", true),
		EmailFrom:       getEnv("EMAIL_FROM", false),
		Environment:     getEnvWithDefault("NODE_ENV", "development"),
	}

	return cfg, nil
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)

	if required && value == "" {
		panic(fmt.Sprintf("missing required environment variable: %s", key))
	}

	return value
}

func getEnvWithDefault(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}