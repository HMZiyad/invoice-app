#!/bin/bash
# setup.sh — One-time setup for Luminous Extraction Suite
set -e

echo "🔧 Setting up Luminous Extraction Suite..."

# 1. Check for PostgreSQL
if ! command -v psql &>/dev/null; then
  echo "❌ psql not found. Installing PostgreSQL via Homebrew..."
  brew install postgresql@17
  brew services start postgresql@17
  echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zprofile
  export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
  sleep 3
fi

# 2. Create database
echo "📦 Creating database luminous_extraction..."
createdb luminous_extraction 2>/dev/null || echo "   (DB already exists, skipping)"

# 3. Run schema
echo "📋 Running schema..."
psql -d luminous_extraction -f backend/src/schema.sql

# 4. Update backend .env with correct Postgres user
PGUSER=$(whoami)
sed -i '' "s|postgresql://postgres:password@localhost:5432|postgresql://$PGUSER@localhost:5432|g" backend/.env
echo "   Updated DATABASE_URL to use user: $PGUSER"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now start the app:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
