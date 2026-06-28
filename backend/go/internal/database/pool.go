package database

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds the configuration settings for the database connection pool.
type Config struct {
	DatabaseURL     string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

// LoadConfig loads the database configuration from environment variables.
func LoadConfig() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	cfg := &Config{
		DatabaseURL:     dbURL,
		MaxConns:        10,
		MinConns:        2,
		MaxConnLifetime: 30 * time.Minute,
		MaxConnIdleTime: 15 * time.Minute,
	}

	if val := os.Getenv("DB_MAX_CONNS"); val != "" {
		if i, err := strconv.ParseInt(val, 10, 32); err == nil {
			cfg.MaxConns = int32(i)
		} else {
			slog.Warn("invalid DB_MAX_CONNS, using default", "val", val, "default", cfg.MaxConns)
		}
	}

	if val := os.Getenv("DB_MIN_CONNS"); val != "" {
		if i, err := strconv.ParseInt(val, 10, 32); err == nil {
			cfg.MinConns = int32(i)
		} else {
			slog.Warn("invalid DB_MIN_CONNS, using default", "val", val, "default", cfg.MinConns)
		}
	}

	if val := os.Getenv("DB_MAX_CONN_LIFETIME"); val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			cfg.MaxConnLifetime = d
		} else {
			slog.Warn("invalid DB_MAX_CONN_LIFETIME, using default", "val", val, "default", cfg.MaxConnLifetime)
		}
	}

	if val := os.Getenv("DB_MAX_CONN_IDLE_TIME"); val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			cfg.MaxConnIdleTime = d
		} else {
			slog.Warn("invalid DB_MAX_CONN_IDLE_TIME, using default", "val", val, "default", cfg.MaxConnIdleTime)
		}
	}

	return cfg, nil
}

// NewPool initializes a pgxpool.Pool based on the provided configuration with retry logic.
func NewPool(ctx context.Context, cfg *Config) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("unable to parse DATABASE_URL: %w", err)
	}

	// Apply configuration overrides
	poolCfg.MaxConns = cfg.MaxConns
	poolCfg.MinConns = cfg.MinConns
	poolCfg.MaxConnLifetime = cfg.MaxConnLifetime
	poolCfg.MaxConnIdleTime = cfg.MaxConnIdleTime

	// Create pool
	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	// Retry connection/ping with backoff
	backoff := 1 * time.Second
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		err = pool.Ping(ctx)
		if err == nil {
			slog.Info("successfully connected to database")
			return pool, nil
		}

		slog.Warn("failed to connect/ping database, retrying with backoff...",
			"attempt", i+1,
			"max_retries", maxRetries,
			"backoff", backoff,
			"error", err,
		)

		select {
		case <-ctx.Done():
			pool.Close()
			return nil, ctx.Err()
		case <-time.After(backoff):
			backoff *= 2
		}
	}

	pool.Close()
	return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
}
