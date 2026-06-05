# DraftDeckAI Backend - Go Servers

This directory contains two Go backend server implementations with **graceful shutdown** support.

## Files

- **`main.go`** - Simple backend server with basic routes
- **`go/cmd/server/main.go`** - Production-ready server with health/ready endpoints
- **`go.mod`** - Go module definition
- **`GRACEFUL_SHUTDOWN_TESTING.md`** - Complete testing guide

## Quick Start

### Prerequisites
- Go 1.21 or later (install from https://golang.org/dl/)

### Run the first server:
```bash
cd backend
go run main.go
```

Expected output:
```
2026/06/06 10:23:45 [INFO] Starting server on :8080
```

### Test graceful shutdown:
```bash
# In a new terminal, send graceful shutdown signal
taskkill /PID <process-id> /SIGTERM  # Windows
# OR press Ctrl+C in the server terminal
```

Expected output:
```
[INFO] Received signal: interrupt - initiating graceful shutdown
[INFO] Server shut down gracefully - all in-flight requests completed
```

## Features

✅ **Signal Handling**
- SIGINT (Ctrl+C) support
- SIGTERM (deployment/scaling) support

✅ **Graceful Shutdown**
- 30-second timeout for in-flight requests
- Stops accepting new connections immediately
- Waits for existing requests to complete
- Force closes on timeout
- Exit code 1 on failure, 0 on success

✅ **Logging**
- Timestamp-based logs
- Signal reception logged
- Shutdown progress logged
- Completion status logged

✅ **Health Checks**
- `/health` - Basic health status
- `/ready` - Readiness probe
- `/api/echo` - Echo endpoint (cmd/server version)

## Configuration

### Shutdown Timeout (Configurable)

Edit the constant in either main.go:

```go
const shutdownTimeoutSeconds = 30  // Change this value
```

### Server Port

```go
const port = ":8080"  // Change to desired port
```

### Timeouts

```go
srv := &http.Server{
	ReadTimeout:  15 * time.Second,  // Request read timeout
	WriteTimeout: 15 * time.Second,  // Response write timeout
	IdleTimeout:  60 * time.Second,  // Idle connection timeout
}
```

## Testing

See **`GRACEFUL_SHUTDOWN_TESTING.md`** for comprehensive testing guide including:
- Graceful shutdown verification
- Request draining verification
- Timeout behavior verification
- Health check testing
- Production build instructions

## Architecture

Both servers implement the standard Go HTTP graceful shutdown pattern:

1. Create `http.Server` with timeouts
2. Start server in background goroutine
3. Listen for OS signals (SIGINT, SIGTERM)
4. Call `srv.Shutdown(ctx)` with timeout context
5. Force close if shutdown times out
6. Exit with appropriate code (0 = success, 1 = error/timeout)

## Standards Compliance

- ✅ Go 1.21+ compatible
- ✅ Follows `http.Server` graceful shutdown best practices
- ✅ Implements proper signal handling
- ✅ Includes structured logging
- ✅ Returns correct exit codes
- ✅ Compatible with Kubernetes liveness/readiness probes

## Next Steps

1. Install Go if not already installed
2. Run `go run main.go` to start a server
3. Test endpoints with `curl http://localhost:8080/health`
4. Send graceful shutdown signal and verify logs
5. See GRACEFUL_SHUTDOWN_TESTING.md for detailed tests
