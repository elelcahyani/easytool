@echo off
echo Starting Easy Tool Frontend...
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting Next.js dev server on http://localhost:3000
npm run dev
