#!/bin/bash
# Railway Deployment Script for Atlas CRM

set -e

echo "🚀 Atlas CRM - Railway Deployment Script"
echo "=========================================="

# Check environment
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ Error: RAILWAY_TOKEN not set"
  echo "Get your token from: https://railway.app/account/tokens"
  exit 1
fi

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
  echo "📦 Installing Railway CLI..."
  npm install -g @railway/cli
fi

# Login to Railway
echo "🔑 Logging into Railway..."
railway login --token "$RAILWAY_TOKEN"

# Link to project
echo "🔗 Linking to project..."
railway link

# Deploy
echo "📤 Deploying to Railway..."
railway up

# Run database migrations
echo "🗄️ Running database migrations..."
railway run npx prisma migrate deploy

# Seed catalog if needed
echo "🌱 Catalog seed available at: /settings"
echo "   Click 'Sembrar Catálogo 2025/2026' after deployment"

# Show deployment status
echo ""
echo "✅ Deployment complete!"
echo ""
railway status

# Show URL
echo ""
echo "🌐 Your app is available at:"
railway domain
