Write-Host "Setting up Requesta HRIMS..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Node version
 = node --version
Write-Host "Node.js version: " -ForegroundColor Cyan

# Install dependencies
Write-Host "
Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if backend is running
Write-Host "
Checking backend connection..." -ForegroundColor Yellow
try {
     = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend is not running at http://localhost:3001" -ForegroundColor Yellow
    Write-Host "Please start the backend server first" -ForegroundColor White
}

Write-Host "
Setup complete! Run the following commands:" -ForegroundColor Green
Write-Host "npm run dev     # Start development server" -ForegroundColor White
Write-Host "npm run build   # Build for production" -ForegroundColor White
Write-Host "npm start       # Start production server" -ForegroundColor White
