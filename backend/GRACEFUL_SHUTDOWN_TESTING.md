# Go Backend Server Setup & Testing Guide

## Prerequisites

### Install Go
1. Download Go from https://golang.org/dl/
2. Install for your OS (Windows, macOS, Linux)
3. Verify installation:
   ```bash
   go version
   ```

---

## Setup Instructions

### 1. Initialize Go Module (First Time Only)

```bash
cd backend
go mod init draftdeckai/backend
```

This creates `go.mod` and `go.sum` files (if they don't exist).

---

## Running the Servers

### Option 1: Run `backend/main.go`

```bash
cd backend
go run main.go
```

**Expected Output:**
```
2026/06/06 10:23:45 [INFO] Starting server on :8080
```

### Option 2: Run `backend/go/cmd/server/main.go`

```bash
cd backend/go/cmd/server
go run main.go
```

**Expected Output:**
```
[SERVER] 2026/06/06 10:23:45 main.go:47: Starting server on :8080
```

---

## Testing Graceful Shutdown

### Test 1: Send SIGTERM (Graceful Shutdown)

**Terminal 1 - Start the server:**
```bash
cd backend
go run main.go
```

**Terminal 2 - Send graceful shutdown signal:**
```bash
# On Windows (PowerShell):
taskkill /PID <process-id> /SIGTERM

# On Linux/macOS:
kill -SIGTERM <process-id>
```

**Expected Output in Terminal 1:**
```
[INFO] Received signal: terminated - initiating graceful shutdown
[INFO] Server shut down gracefully - all in-flight requests completed
```

### Test 2: Send SIGINT (Ctrl+C)

**Terminal 1 - Start the server:**
```bash
cd backend
go run main.go
```

**In same terminal - Press Ctrl+C:**

**Expected Output:**
```
^C[INFO] Received signal: interrupt - initiating graceful shutdown
[INFO] Server shut down gracefully - all in-flight requests completed
```

---

## Testing Active Requests During Shutdown

### Terminal 1: Start Server
```bash
cd backend
go run main.go
```

### Terminal 2: Make a long-running request
```bash
# This request will take ~100ms to complete
curl http://localhost:8080/api/test
```

### Terminal 2 (immediately after): Send shutdown signal
```bash
# While /api/test is still processing
taskkill /PID <process-id> /SIGTERM  # Windows

# OR manually Ctrl+C in Terminal 1
```

**Expected Behavior:**
- Server receives SIGTERM/SIGINT
- Server stops accepting NEW connections
- Existing `/api/test` request completes (within 30s timeout)
- Server exits gracefully with exit code 0

---

## Testing Timeout Behavior

### Test Long-Running Requests (>30s)

If you want to test the timeout:

1. Modify the routes to add a longer sleep:
   ```go
   time.Sleep(31 * time.Second)  // Longer than 30s timeout
   ```

2. Start a request and send SIGTERM while it's running
3. Expected output after 30s:
   ```
   [ERROR] Graceful shutdown timed out or failed
   [ERROR] Force close failed
   Server terminated with error - exit code 1
   ```

---

## Health Check Endpoints

While server is running, test these in another terminal:

```bash
# Health check
curl http://localhost:8080/health
# Output: {"status":"healthy"}

# Test endpoint (backend/main.go)
curl http://localhost:8080/api/test
# Output: {"message":"success"}

# Ready endpoint (backend/go/cmd/server/main.go)
curl http://localhost:8080/ready
# Output: {"ready":true}

# Echo endpoint (backend/go/cmd/server/main.go)
curl "http://localhost:8080/api/echo?msg=hello"
# Output: {"echo":"hello"}
```

---

## Build for Production

### Compile to binary (backend/main.go):
```bash
cd backend
go build -o server main.go
./server  # Run the binary
```

### Compile to binary (backend/go/cmd/server/main.go):
```bash
cd backend/go/cmd/server
go build -o server main.go
./server  # Run the binary
```

---

## Acceptance Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| SIGINT/SIGTERM handling | Run server, press Ctrl+C or send kill -SIGTERM |
| Server rejects new connections | Send SIGTERM, try `curl http://localhost:8080/health` during shutdown (will fail) |
| Existing requests complete | Make a request, send SIGTERM, request should complete within 30s |
| Exit code 1 on timeout | Check exit code: `echo $?` (Unix) or `$LASTEXITCODE` (PowerShell) |
| Exit code 0 on success | Graceful shutdown should result in exit code 0 |

---

## Exit Codes

- **Exit Code 0**: Graceful shutdown completed successfully
- **Exit Code 1**: Shutdown timeout or forced close due to error
- **Exit Code 1**: Server error during startup (ListenAndServe failed)

---

## Troubleshooting

### Port Already in Use
If you get `address already in use`:
```bash
# Find process using port 8080
# Windows:
netstat -ano | findstr :8080

# Kill it:
taskkill /PID <process-id> /F
```

### Go Command Not Found
- Install Go from https://golang.org/dl/
- Add Go to your PATH environment variable
- Restart terminal after installation

### Module Not Found
```bash
cd backend
go mod init draftdeckai/backend
go mod tidy
```
