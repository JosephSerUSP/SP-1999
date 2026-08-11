@echo off
echo Starting RPG Maker Style Editor...
cd editor
if not exist "node_modules\express\" (
    echo Installing dependencies...
    npm install express
)
start http://localhost:3000
node server.js
pause
