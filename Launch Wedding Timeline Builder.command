#!/bin/bash
# Double-click this file to start the Wedding Timeline Builder app.
# It will install dependencies (first run only) and open the app in your browser.

# Move into the folder this script lives in, no matter where it's double-clicked from
cd "$(dirname "$0")"

echo "Wedding Timeline Builder"
echo "-------------------------"

if [ ! -d "node_modules" ]; then
  echo "First time setup — installing dependencies, this may take a minute..."
  npm install
fi

echo "Starting the app... your browser will open automatically."
echo "To stop the app, close this window or press Control+C."
echo ""

npm start
