param(
    [switch]$EnableScholarTask,
    [string]$TaskStartTime = "09:00",
    [switch]$RunBuild,
    [switch]$RunScholarUpdate
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

function Assert-CommandExists {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available in PATH."
    }
}

Write-Host "Bootstrapping repository at: $repoRoot" -ForegroundColor Cyan

Assert-CommandExists "git"
Assert-CommandExists "node"
Assert-CommandExists "npm"

$envLocal = Join-Path $repoRoot ".env.local"
$envExample = Join-Path $repoRoot ".env.example"

if (-not (Test-Path $envLocal)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envLocal
        Write-Host "Created .env.local from .env.example" -ForegroundColor Yellow
        Write-Host "Update .env.local values before production use." -ForegroundColor Yellow
    } else {
        Write-Host "No .env.local found and no .env.example available." -ForegroundColor Yellow
    }
} else {
    Write-Host ".env.local already exists" -ForegroundColor Green
}

Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
npm install

if ($RunBuild) {
    Write-Host "Running production build..." -ForegroundColor Cyan
    npm run build
}

if ($RunScholarUpdate) {
    Write-Host "Running scholar cache update..." -ForegroundColor Cyan
    npm run update-scholar
}

if ($EnableScholarTask) {
    $registerScript = Join-Path $scriptDir "register-scholar-task.ps1"
    if (-not (Test-Path $registerScript)) {
        throw "Cannot find register script at $registerScript"
    }

    Write-Host "Registering scheduled task at $TaskStartTime..." -ForegroundColor Cyan
    & $registerScript -StartTime $TaskStartTime
}

Write-Host "Bootstrap completed." -ForegroundColor Green
Write-Host "Next: run scripts/verify-machine-setup.ps1" -ForegroundColor Green
