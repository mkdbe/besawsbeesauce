#!/bin/bash
# Run from your Mac to build and push to Linode.
# Usage: ./deploy/sync.sh

set -e

REMOTE="mdbe@linode"
REMOTE_DIR="/var/www/besawsbeesauce.com"
LOCAL_DIR="/Users/mdbe/claude/besawsbeesauce.com"

echo "==> Building locally..."
cd "$LOCAL_DIR"
npm run build

echo "==> Syncing to Linode..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env*' \
  --exclude='data/' \
  --exclude='public/uploads/' \
  "$LOCAL_DIR/" \
  "$REMOTE:$REMOTE_DIR/"

echo "==> Running deploy on server..."
ssh "$REMOTE" "bash $REMOTE_DIR/deploy/deploy.sh"
