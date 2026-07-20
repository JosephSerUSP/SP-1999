#!/bin/bash
echo "Starting RPG Maker Style Editor..."
cd editor

if [ ! -d "node_modules/express" ]; then
    echo "Installing dependencies..."
    npm init -y
    npm install express
fi

if which xdg-open > /dev/null
then
  xdg-open http://localhost:3000 &
elif which open > /dev/null
then
  open http://localhost:3000 &
fi

node server.js
