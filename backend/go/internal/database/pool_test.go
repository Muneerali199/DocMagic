package database

import (
	"os"
	"testing"
	"time"
)

func TestLoadConfig_Defaults(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/dbname")
	defer os.Unsetenv("DATABASE_URL")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.MaxConns != 10 {
		t.Errorf("expected MaxConns to be 10, got %d", cfg.MaxConns)
	}
	if cfg.MinConns != 2 {
		t.Errorf("expected MinConns to be 2, got %d", cfg.MinConns)
	}
	if cfg.MaxConnLifetime != 30*time.Minute {
		t.Errorf("expected MaxConnLifetime to be 30m, got %v", cfg.MaxConnLifetime)
	}
}

func TestLoadConfig_Overrides(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/dbname")
	os.Setenv("DB_MAX_CONNS", "25")
	os.Setenv("DB_MIN_CONNS", "5")
	os.Setenv("DB_MAX_CONN_LIFETIME", "1h")
	os.Setenv("DB_MAX_CONN_IDLE_TIME", "10m")

	defer func() {
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("DB_MAX_CONNS")
		os.Unsetenv("DB_MIN_CONNS")
		os.Unsetenv("DB_MAX_CONN_LIFETIME")
		os.Unsetenv("DB_MAX_CONN_IDLE_TIME")
	}()

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.MaxConns != 25 {
		t.Errorf("expected MaxConns to be 25, got %d", cfg.MaxConns)
	}
	if cfg.MinConns != 5 {
		t.Errorf("expected MinConns to be 5, got %d", cfg.MinConns)
	}
	if cfg.MaxConnLifetime != time.Hour {
		t.Errorf("expected MaxConnLifetime to be 1h, got %v", cfg.MaxConnLifetime)
	}
	if cfg.MaxConnIdleTime != 10*time.Minute {
		t.Errorf("expected MaxConnIdleTime to be 10m, got %v", cfg.MaxConnIdleTime)
	}
}
