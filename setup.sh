#!/bin/bash

# MediSync Setup Script - Automated Project Setup

set -e

echo "🏥 Welcome to MediSync Setup"
echo "=============================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "  Creating .env from .env.example..."
    cp .env.example .env
fi

echo "  Installing dependencies..."
npm install

echo "  Building TypeScript..."
npm run build

cd ..
echo "✅ Backend setup completed"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
    echo "  Creating .env.local from .env.example..."
    cp .env.example .env.local
fi

echo "  Installing dependencies..."
npm install

cd ..
echo "✅ Frontend setup completed"
echo ""

# Docker setup
echo "🐳 Docker Setup"
echo "==============="
echo ""
echo "To run with Docker, use:"
echo "  docker-compose up -d"
echo ""

# Final instructions
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "📝 Next steps:"
echo "1. Update environment variables:"
echo "   - Backend: ./backend/.env"
echo "   - Frontend: ./frontend/.env.local"
echo ""
echo "2. Start development:"
echo "   - Terminal 1: cd backend && npm run dev"
echo "   - Terminal 2: cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""
echo "4. Default MongoDB:"
echo "   - URI: mongodb://localhost:27017/medisync"
echo ""
echo "5. Redis:"
echo "   - URL: redis://localhost:6379"
echo ""
