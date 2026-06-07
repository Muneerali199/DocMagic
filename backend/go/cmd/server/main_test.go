package main

import (
	"context"
	"net"
	"net/http"
	"sync"
	"testing"
	"time"
)

func TestGracefulShutdownDrainsRequests(t *testing.T) {
	// Keep timeout short for test speed, but still validate draining.
	shutdownTimeout := 2 * time.Second

	// Create a listener on an ephemeral port.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("net.Listen: %v", err)
	}
	defer ln.Close()

	start := make(chan struct{})
	startedOnce := sync.Once{}

	srv := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			startedOnce.Do(func() { close(start) })
			// Simulate in-flight work longer than typical request latency.
			time.Sleep(300 * time.Millisecond)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"ok":true}`))
		}),
	}

	serverErr := make(chan error, 1)
	go func() {
		serverErr <- srv.Serve(ln)
	}()
	defer func() {
		// Ensure the server is stopped even if the test fails.
		ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
		defer cancel()
		_ = srv.Shutdown(ctx)
	}()

	<-start // ensure handler has started

	reqDone := make(chan error, 1)
	go func() {
		client := &http.Client{Timeout: 3 * time.Second}
		resp, err := client.Get("http://" + ln.Addr().String() + "/")
		if err != nil {
			reqDone <- err
			return
		}
		defer resp.Body.Close()
		reqDone <- nil
	}()

	// Wait a moment to ensure the request is in-flight.
	time.Sleep(50 * time.Millisecond)

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	shutdownStart := time.Now()
	if err := srv.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown: %v", err)
	}
	shutdownDur := time.Since(shutdownStart)
	if shutdownDur > shutdownTimeout {
		t.Fatalf("Shutdown exceeded timeout: %v > %v", shutdownDur, shutdownTimeout)
	}

	if err := <-reqDone; err != nil {
		t.Fatalf("in-flight request error after shutdown: %v", err)
	}

	// Serve should return ErrServerClosed after Shutdown.
	if err := <-serverErr; err != http.ErrServerClosed {
		// Serve may return nil in rare cases; accept nil.
		if err != nil {
			t.Fatalf("Serve error: %v", err)
		}
	}
}

func TestGracefulShutdownTimeout(t *testing.T) {
	shutdownTimeout := 200 * time.Millisecond

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("net.Listen: %v", err)
	}
	defer ln.Close()

	block := make(chan struct{})

	srv := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			<-block // will exceed shutdown timeout
			w.WriteHeader(http.StatusOK)
		}),
	}

	serverErr := make(chan error, 1)
	go func() {
		serverErr <- srv.Serve(ln)
	}()
	defer func() {
		close(block)
		ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
		defer cancel()
		_ = srv.Shutdown(ctx)
	}()

	// Fire the request.
	client := &http.Client{Timeout: 2 * time.Second}
	go func() {
		_, _ = client.Get("http://" + ln.Addr().String() + "/")
	}()

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	shutdownStart := time.Now()
	err = srv.Shutdown(ctx)
	shutdownDur := time.Since(shutdownStart)

	if err == nil {
		t.Fatalf("expected Shutdown error due to timeout, got nil")
	}
	if shutdownDur < shutdownTimeout {
		t.Fatalf("Shutdown returned too quickly: %v < %v", shutdownDur, shutdownTimeout)
	}

	if serveErr := <-serverErr; serveErr != http.ErrServerClosed {
		if serveErr != nil {
			t.Fatalf("Serve error: %v", serveErr)
		}
	}
}

