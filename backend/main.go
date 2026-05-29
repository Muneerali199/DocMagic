package main

import (
	"fmt"
	"log"

	"draftdeckai-go/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	fmt.Printf("Environment: %s\n", cfg.Environment)
}