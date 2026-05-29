# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY . .

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd

# Runtime stage
FROM alpine:latest

WORKDIR /root/

RUN adduser -D appuser

COPY --from=builder /app/server .

USER appuser

EXPOSE 8080

CMD ["./server"]