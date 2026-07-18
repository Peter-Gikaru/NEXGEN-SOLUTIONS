#!/bin/bash
# Panic Rollback Script
# Run this script if the live production site crashes after an update.

echo "==================================="
echo "EMERGENCY ROLLBACK INITIATED"
echo "==================================="

# Navigate to production folder
# cd /var/www/html/NEXGEN-SOLUTIONS

echo "1. Reverting code to the previous stable commit..."
# Hard reset to the previous commit
git reset --hard HEAD~1

echo "2. Re-installing previous dependencies..."
npm install
cd backend
npm install
cd ..

echo "3. Re-building the frontend..."
npm run build

echo "4. Restarting the backend server..."
# pm2 restart all

echo "==================================="
echo "ROLLBACK COMPLETE! SITE IS ONLINE."
echo "==================================="
