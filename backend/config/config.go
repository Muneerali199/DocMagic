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
	databaseURL, err := getRequiredEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}

	supabaseURL, err := getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL")
	if err != nil {
		return nil, err
	}

	supabaseAnonKey, err := getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	if err != nil {
		return nil, err
	}

	openAIKey, err := getRequiredEnv("OPENAI_API_KEY")
	if err != nil {
		return nil, err
	}

	cfg := &Config{
		DatabaseURL:     databaseURL,
		SupabaseURL:     supabaseURL,
		SupabaseAnonKey: supabaseAnonKey,
		OpenAIAPIKey:    openAIKey,
		EmailFrom:       os.Getenv("EMAIL_FROM"),
		Environment:     getEnvWithDefault("NODE_ENV", "development"),
	}

	return cfg, nil
}

func getRequiredEnv(key string) (string, error) {
	value := os.Getenv(key)

	if value == "" {
		return "", fmt.Errorf("missing required environment variable: %s", key)
	}

	return value, nil
}

func getEnvWithDefault(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}