package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Database wraps a pgxpool.Pool to expose database operations.
type Database struct {
	Pool *pgxpool.Pool
}

// NewDatabase initializes a Database struct with the given connection pool.
func NewDatabase(pool *pgxpool.Pool) *Database {
	return &Database{
		Pool: pool,
	}
}

// Ping verifies the database connection is still alive.
func (db *Database) Ping(ctx context.Context) error {
	if db.Pool == nil {
		return fmt.Errorf("database pool is not initialized")
	}
	return db.Pool.Ping(ctx)
}

// Close closes all connections in the database pool.
func (db *Database) Close() {
	if db.Pool != nil {
		db.Pool.Close()
	}
}
