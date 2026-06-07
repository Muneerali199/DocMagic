# TODO - PR #958 (Go Backend Graceful Shutdown)

## Completed
- [x] Remove extraneous audit/verification markdown files from `backend/`.

## Next Steps
- [ ] (2) Remove duplicate server: delete `backend/main.go`.
- [ ] Update `backend/README.md` to reference the canonical server path `backend/go/cmd/server/`.
- [ ] (3) Add graceful shutdown tests:
  - [ ] Add `backend/go/cmd/server/main_test.go`.
  - [ ] Refactor `backend/go/cmd/server/main.go` slightly (only what’s needed) to make shutdown testable without executing `os.Exit`.
- [ ] Run `cd backend && go test ./...`.

