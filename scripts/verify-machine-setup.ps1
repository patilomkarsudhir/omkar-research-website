$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

function Test-Command {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Write-Check {
    param(
        [string]$Label,
        [bool]$Ok,
        [string]$Details = ""
    )

    $status = if ($Ok) { "OK" } else { "MISSING" }
    $color = if ($Ok) { "Green" } else { "Yellow" }

    if ([string]::IsNullOrWhiteSpace($Details)) {
        Write-Host "[$status] $Label" -ForegroundColor $color
    } else {
        Write-Host "[$status] $Label - $Details" -ForegroundColor $color
    }
}

Write-Host "Verifying machine setup at: $repoRoot" -ForegroundColor Cyan

Write-Check "git command" (Test-Command "git")
Write-Check "node command" (Test-Command "node")
Write-Check "npm command" (Test-Command "npm")

$envLocalPath = Join-Path $repoRoot ".env.local"
$envExists = Test-Path $envLocalPath
Write-Check ".env.local file" $envExists

if ($envExists) {
    $envContent = Get-Content $envLocalPath -ErrorAction SilentlyContinue
    $hasScholar = $envContent | Select-String -Pattern "^\s*SCHOLAR_USER\s*=\s*.+" -Quiet
    $hasPublicScholar = $envContent | Select-String -Pattern "^\s*NEXT_PUBLIC_SCHOLAR_USER\s*=\s*.+" -Quiet

    Write-Check "SCHOLAR_USER set" $hasScholar
    Write-Check "NEXT_PUBLIC_SCHOLAR_USER set" $hasPublicScholar
}

$pkgLock = Join-Path $repoRoot "package-lock.json"
$nodeModules = Join-Path $repoRoot "node_modules"
Write-Check "npm dependencies installed" (Test-Path $nodeModules) "Checked node_modules presence"
Write-Check "lockfile present" (Test-Path $pkgLock)

$taskName = "Update Scholar Cache"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Write-Check "Windows scheduled task '$taskName'" ([bool]$task)

if ($task) {
    $info = Get-ScheduledTaskInfo -TaskName $taskName
    Write-Host "[INFO] Next task run: $($info.NextRunTime)" -ForegroundColor Cyan
    Write-Host "[INFO] Last task result: $($info.LastTaskResult)" -ForegroundColor Cyan
}

Write-Host "Verification completed." -ForegroundColor Green
