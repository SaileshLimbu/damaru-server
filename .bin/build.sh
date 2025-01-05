#!/bin/bash

# Exit on error
set -e

# Variables
SERVER="ubuntu@ec2-13-201-152-191.ap-south-1.compute.amazonaws.com"
REMOTE_DIR="/home/ubuntu/damaru-node"
DIST_ZIP="dist.zip"
DIST_DIR="dist"

# Build the project
echo "Building project..."
npm run build

# Remove any existing dist.zip
echo "Removing old zip file..."
rm -f $DIST_ZIP

# Zip the dist directory
echo "Creating new zip file..."
zip -r $DIST_ZIP $DIST_DIR

# Transfer zip to remote server
echo "Uploading zip file to server..."
scp $DIST_ZIP $SERVER:$REMOTE_DIR

# SSH into the server and deploy
echo "Deploying on server..."
