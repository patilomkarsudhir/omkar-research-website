# PDF to Markdown Converter Setup Script
# This script installs dependencies and tests the converter

Write-Host "PDF to Markdown Converter Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if pip is available
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✓ pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pip not found. Please install pip first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements-pdf-converter.txt
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host "`nRunning tests..." -ForegroundColor Yellow
try {
    python test-pdf-converter.py
    Write-Host "`n✓ Setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Tests failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nUsage Examples:" -ForegroundColor Cyan
Write-Host "python pdf-to-markdown.py paper.pdf" -ForegroundColor White
Write-Host "python pdf-to-markdown.py paper.pdf -o converted_output" -ForegroundColor White
Write-Host "python pdf-to-markdown.py paper.pdf --no-images" -ForegroundColor White

Write-Host "`nFor more help, see PDF_CONVERTER_README.md" -ForegroundColor Cyan
