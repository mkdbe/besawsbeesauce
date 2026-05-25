#!/bin/bash
# Runs on the Linode after rsyncing files.
# Build happens locally — this only installs runtime deps and restarts.

set -e

APP_DIR="/var/www/besawsbeesauce.com"
SERVICE="besawsbeesauce"

echo "==> Installing runtime dependencies..."
cd "$APP_DIR"
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm ci --omit=dev

echo "==> Restarting service..."
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

echo "==> Pushing to GitHub..."
cd "$APP_DIR"
git add -A
git diff --cached --quiet || git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push

echo "==> Done."
