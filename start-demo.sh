#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

port_in_use() { ss -ltn "sport = :$1" | grep -q LISTEN; }

for p in 8000 4001; do
  if port_in_use "$p"; then
    echo "Port $p is already in use. Stop the old process first."
    exit 1
  fi
done

if [ ! -d "$ROOT/frontend/dist" ]; then
  echo "Building the frontend..."
  (cd "$ROOT/frontend" && npm run build) || exit 1
fi

cleanup() {
  echo
  echo "Stopping..."
  [ -n "${ML_PID:-}" ] && kill "$ML_PID" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

echo "Starting the ML service (loading the model can take a minute)..."
cd "$ROOT/ml-service"
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/ml-service.log" 2>&1 &
ML_PID=$!

READY=0
for i in $(seq 1 120); do
  if curl -sf http://localhost:8000/health > /dev/null; then READY=1; break; fi
  if ! kill -0 "$ML_PID" 2>/dev/null; then
    echo "The ML service crashed. See logs/ml-service.log"
    exit 1
  fi
  sleep 1
done
if [ "$READY" != 1 ]; then
  echo "The ML service was not ready after 120 s. See logs/ml-service.log"
  exit 1
fi

echo "ML service ready."
echo "App: http://localhost:4001   (press Ctrl+C to stop everything)"
cd "$ROOT/backend"
node src/index.js
