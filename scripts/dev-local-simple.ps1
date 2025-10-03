# Development startup script for Acquisition App with local PostgreSQL
# This script starts the application in development mode with a local PostgreSQL database

Write-Host "Starting Acquisition App in Local Development Mode" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "The .env.local file should have been created automatically." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Building and starting development containers..." -ForegroundColor Cyan
Write-Host "- Local PostgreSQL database will be created" -ForegroundColor Gray
Write-Host "- Application will run with hot reload enabled" -ForegroundColor Gray
Write-Host ""

# Stop any existing containers
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml down --remove-orphans | Out-Null

# Start the development environment
Write-Host "Starting services..." -ForegroundColor Green
docker compose -f docker-compose.local.yml up --build -d

# Wait for PostgreSQL to be ready
Write-Host "Waiting for the database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if PostgreSQL is ready
$dbReady = docker compose -f docker-compose.local.yml exec postgres pg_isready -U postgres -d acquisitions_dev
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database is ready!" -ForegroundColor Green
    
    # Check if migration file exists and apply it manually
    if (Test-Path "drizzle/0000_robust_garia.sql") {
        Write-Host "Applying database schema..." -ForegroundColor Cyan
        Get-Content drizzle/0000_robust_garia.sql | docker compose -f docker-compose.local.yml exec -T postgres psql -U postgres -d acquisitions_dev | Out-Null
    }
    
    Write-Host ""
    Write-Host "Development environment started successfully!" -ForegroundColor Green
    Write-Host "Application: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Database: postgres://postgres:dev_password@localhost:5432/acquisitions_dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To view logs: docker compose -f docker-compose.local.yml logs -f" -ForegroundColor Gray
    Write-Host "To stop the environment: docker compose -f docker-compose.local.yml down" -ForegroundColor Gray
    
    # Test the application
    Write-Host ""
    Write-Host "Testing application..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 10
        Write-Host "Application is responding: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "Application might still be starting up. Try accessing http://localhost:3000 in a few moments." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "Error: Database failed to start properly" -ForegroundColor Red
    Write-Host "Database logs:" -ForegroundColor Yellow
    docker compose -f docker-compose.local.yml logs postgres
    exit 1
}