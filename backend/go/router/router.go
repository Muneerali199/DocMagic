package router

import (
	"net/http"
	"time"

	"github.com/Muneerali199/Draftdeckai/backend/go/middleware"
)

func SetupRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	var handler http.Handler = mux

	handler = middleware.RequestID(handler)
	handler = middleware.Recovery(handler)
	handler = middleware.CORS(handler)
	handler = middleware.Timeout(10 * time.Second)(handler)

	return handler
}
