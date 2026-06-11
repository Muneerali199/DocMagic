package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Muneerali199/Draftdeckai/backend/go/internal/database"
	"github.com/Muneerali199/Draftdeckai/backend/go/middleware"
	"github.com/Muneerali199/Draftdeckai/backend/go/pkg/config"
)

func initLogger() {
	level := slog.LevelInfo

	switch os.Getenv("LOG_LEVEL") {
	case "DEBUG":
		level = slog.LevelDebug
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	}

	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	})
	slog.SetDefault(slog.New(handler))
}

func main() {
	initLogger()

	slog.Info("starting DraftDeckAI Go backend")

	// Validate all required environment variables
	if err := config.ValidateEnv(); err != nil {
		log.Fatalf("FATAL: %v", err)
	}

	// Print startup summary
	config.PrintStartupSummary()

	// Initialize Database Connection Pool
	ctx := context.Background()
	dbCfg, err := database.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load database config: %v", err)
	}

	slog.Info("initializing database pool...")
	pool, err := database.NewPool(ctx, dbCfg)
	if err != nil {
		log.Fatalf("Failed to initialize database pool: %v", err)
	}
	db := database.NewDatabase(pool)
	slog.Info("database connection pool initialized successfully")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte(`{"status":"ok"}`)); err != nil {
			slog.Error("health write error", slog.Any("error", err))
		}
	})

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte(`{"status":"ok","service":"Draftdeckai Go Backend"}`)); err != nil {
			slog.Error("healthz write error", slog.Any("error", err))
		}
	})

	// Apply middleware: Recoverer → RequestLogger → mux
	handler := middleware.Recoverer(middleware.RequestLogger(mux))

	slog.Info("starting server", slog.String("port", port))

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server failed to start", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	// Wait for terminate signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	slog.Info("shutting down server", slog.String("signal", sig.String()))

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("server forced to shutdown", slog.Any("error", err))
		db.Close()
		os.Exit(1)
	}

	db.Close()
	slog.Info("database connection pool closed")
	slog.Info("server stopped gracefully")
}
