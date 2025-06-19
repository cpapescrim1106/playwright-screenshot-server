#!/bin/bash

APP_NAME="playwright-screenshot-server"
SERVER_URL="https://captain.srv835477.hstgr.cloud"

if [[ -z "$CAPROVER_TOKEN" ]]; then
  echo "❌ Error: CAPROVER_TOKEN is not set."
  exit 1
fi

echo "📦 Creating deploy.tar.gz..."
tar --exclude=node_modules --exclude=deploy.tar.gz -czf deploy.tar.gz .

echo "🚀 Deploying to CapRover..."
NODE_TLS_REJECT_UNAUTHORIZED=0 npx caprover deploy \
  --caproverUrl "$SERVER_URL" \
  --appName "$APP_NAME" \
  --appToken "$CAPROVER_TOKEN" \
  --tarFile deploy.tar.gz

if [[ $? -eq 0 ]]; then
  echo "✅ Deploy succeeded! App is live at https://playwright-screenshot-server.srv835477.hstgr.cloud"
else
  echo "❌ Deploy failed."
fi
