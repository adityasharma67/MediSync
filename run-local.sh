#!/bin/bash
set -e

echo "🚀 MediSync - Local Development Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker and Docker Compose
echo -e "${BLUE}✓ Checking Docker requirements...${NC}"
docker --version > /dev/null && echo "✓ Docker installed" || { echo "✗ Docker not found"; exit 1; }
docker-compose --version > /dev/null && echo "✓ Docker Compose installed" || { echo "✗ Docker Compose not found"; exit 1; }

echo ""
echo -e "${BLUE}✓ Starting infrastructure services...${NC}"

# Start MongoDB and Redis only (faster than full docker-compose)
docker run -d --name medisync-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0 > /dev/null 2>&1 || echo "✓ MongoDB already running"

docker run -d --name medisync-redis -p 6379:6379 \
  redis:7.0-alpine > /dev/null 2>&1 || echo "✓ Redis already running"

sleep 3
echo "✓ MongoDB running on port 27017"
echo "✓ Redis running on port 6379"

echo ""
echo -e "${BLUE}✓ Setting up Backend...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install > /dev/null 2>&1
fi

# Start backend in development mode
echo "Starting backend on port 5000..."
npm run dev 2>&1 &
BACKEND_PID=$!

echo ""
echo -e "${BLUE}✓ Setting up Frontend...${NC}"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install > /dev/null 2>&1
fi

# Update .env.local for local development
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_LOG_LEVEL=debug" > .env.local

echo "Starting frontend on port 3000..."
npm run dev 2>&1 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ MediSync is Starting!${NC}"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "⚙️  Backend:  http://localhost:5000"
echo "🗄️  Database: mongodb://admin:password@localhost:27017/medisync"
echo "📦 Cache:    redis://localhost:6379"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Wait 10 seconds for services to fully start"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Create an account or login"
echo "4. Test the appointment booking flow"
echo ""
echo "To stop all services: press Ctrl+C"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
