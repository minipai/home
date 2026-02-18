#!/bin/bash
set -e

DROPLET_IP="134.199.156.190"
DROPLET_USER="root"

echo "=== Deploying stylecoder.tw ==="

echo "[1/2] Building..."
npm run build

echo "[2/2] Uploading..."
rsync -az --delete dist/ "$DROPLET_USER@$DROPLET_IP:/srv/home/"

echo "=== Deployed to https://stylecoder.tw ==="
