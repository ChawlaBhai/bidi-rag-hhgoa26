#!/bin/bash
echo "=========================================================="
echo "🚀 STARTING HH GOA 2026 VOICE-ENABLED INDIC RAG SYSTEM"
echo "=========================================================="

# Export Python User path if needed
export PYTHONPATH=$HOME/Library/Python/3.14/lib/python/site-packages:$PYTHONPATH

# Kill existing servers if any
pkill -f "uvicorn app.main:app" || true
pkill -f "next dev" || true

# Start FastAPI Backend on port 8000
echo "Starting FastAPI Backend Server on http://127.0.0.1:8000 ..."
cd backend
$HOME/Library/Python/3.14/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Start Next.js Frontend on port 3000
echo "Starting Neubrutalist Next.js Frontend on http://localhost:3000 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================================="
echo "✨ VOICE RAG IS READY!"
echo "👉 Open Frontend: http://localhost:3000"
echo "👉 API Endpoint: http://127.0.0.1:8000"
echo "=========================================================="

wait $BACKEND_PID $FRONTEND_PID
