#!/bin/bash
# Staging / Sandbox Auto Deploy Script
# This script pulls from the 'staging' branch to safely test features before they go live.

echo "==================================="
echo "Sandbox Auto-Deploy Started"
echo "==================================="

# Navigate to staging folder (assumes you cloned the repo to NEXGEN-STAGING)
# cd /var/www/html/NEXGEN-STAGING

# Fetch the latest information from GitHub silently
git fetch origin staging

# Check if the local code is different from the GitHub code
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL != $REMOTE ]; then
    echo "$(date): New code found on STAGING branch! Pulling from GitHub..."
    
    # Pull the new code
    git pull origin staging
    
    # Install any new packages
    echo "Installing frontend dependencies..."
    npm install
    
    # Build the new frontend
    echo "Building staging frontend..."
    npm run build
    
    # Update backend packages
    echo "Installing backend dependencies..."
    cd backend
    npm install
    
    # Run database migrations just in case (using development/staging DB)
    npx prisma generate
    npx prisma migrate deploy
    
    echo "Restarting staging backend server..."
    # If using PM2, you would restart the staging instance:
    # pm2 restart nexgen-staging-backend
    
    echo "$(date): Sandbox update complete!"
else
    # Do nothing if there are no new updates
    echo "$(date): No new features to deploy to Sandbox."
    exit 0
fi
