#!/bin/bash

# Production Build & Deployment Script
# This script builds both frontend and backend for production

set -e

echo "🚀 MediSync Production Build Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
check_env_files() {
  echo -e "\n${YELLOW}📋 Checking environment files...${NC}"
  
  if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found${NC}"
    echo "Copy backend/.env.example to backend/.env and fill in the values"
    exit 1
  fi
  
  if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}❌ frontend/.env.local not found${NC}"
    echo "Copy frontend/.env.example to frontend/.env.local and fill in the values"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Environment files found${NC}"
}

# Build backend
build_backend() {
  echo -e "\n${YELLOW}🏗️  Building backend...${NC}"
  
  cd backend
  npm install
  npm run build
  cd ..
  
  echo -e "${GREEN}✓ Backend build complete${NC}"
}

# Build frontend
build_frontend() {
  echo -e "\n${YELLOW}🎨 Building frontend...${NC}"
  
  cd frontend
  npm install
  npm run build
  cd ..
  
  echo -e "${GREEN}✓ Frontend build complete${NC}"
}

# Create deployment package
create_deployment_package() {
  echo -e "\n${YELLOW}📦 Creating deployment package...${NC}"
  
  mkdir -p deploy
  
  # Copy backend dist
  cp -r backend/dist deploy/backend
  cp backend/package.json deploy/backend/
  cp backend/package-lock.json deploy/backend/ 2>/dev/null || true
  
  # Copy frontend build
  cp -r frontend/.next deploy/frontend
  cp -r frontend/public deploy/frontend/ 2>/dev/null || true
  cp frontend/package.json deploy/frontend/
  cp frontend/package-lock.json deploy/frontend/ 2>/dev/null || true
  
  # Copy docker files
  cp docker-compose.yml deploy/
  cp backend/Dockerfile deploy/backend/
  cp frontend/Dockerfile deploy/frontend/
  
  # Copy .env templates
  cp backend/.env.example deploy/backend/.env.example
  cp frontend/.env.example deploy/frontend/.env.example
  
  echo -e "${GREEN}✓ Deployment package created in ./deploy${NC}"
}

# Main execution
main() {
  check_env_files
  build_backend
  build_frontend
  create_deployment_package
  
  echo -e "\n${GREEN}🎉 Production build complete!${NC}"
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Review the ./deploy directory"
  echo "2. Update .env files with production values"
  echo "3. Deploy to your hosting platform:"
  echo "   - Backend: Render.com, Railway, Heroku, AWS, etc."
  echo "   - Frontend: Vercel, Netlify, AWS Amplify, etc."
  echo "   - Or use Docker & docker-compose for self-hosted"
}

main
