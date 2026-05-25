#!/bin/bash
# Runs on the Linode after rsyncing files.
# Build happens locally — this only installs runtime deps and restarts.

set -e

APP_DIR="/var/www/besawsbeesauce.com"
SERVICE="besawsbeesauce"

echo "==> Checking dependencies..."
cd "$APP_DIR"
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
# Only reinstall if package-lock.json changed — npm ci wipes node_modules and OOMs on this server
if git diff HEAD~1 --name-only 2>/dev/null | grep -q "package-lock.json"; then
  echo "==> package-lock.json changed — running npm install..."
  npm install --omit=dev --prefer-offline
else
  echo "==> Dependencies unchanged — skipping install."
fi

echo "==> Restarting service..."
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

echo "==> Pushing to GitHub..."
cd "$APP_DIR"
git add -A
git diff --cached --quiet || git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push

echo "==> Done."
