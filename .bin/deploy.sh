#!/bin/bash

# Exit on error
set -e

REMOTE_DIR="/home/ubuntu/damaru-node"
DIST_ZIP="dist.zip"

echo "Stopping PM2 process..."
pm2 stop 0

# Navigate to the project directory
cd $REMOTE_DIR

# Backup database.sqlite
echo "Backing up database.sqlite..."
if [ -f "dist/database.sqlite" ]; then
  mv dist/database.sqlite database.sqlite
fi

# Clean up old dist directory
echo "Removing old dist directory..."
rm -rf $DIST_DIR

# Unzip the new distribution
echo "Unzipping new distribution..."
unzip -o $DIST_ZIP

# Restore database and environment files
echo "Restoring database and .env file..."
if [ -f "database.sqlite" ]; then
  cp database.sqlite dist/
fi
cp .env dist/

# Restart the PM2 process
echo "Starting PM2 process..."
pm2 start 0

# Cleanup local zip
echo "Cleaning up local zip file..."
rm -f $DIST_ZIP

echo "Deployment completed successfully!"