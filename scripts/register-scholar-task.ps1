param(
    [string]$TaskName = "Update Scholar Cache",
    [string]$StartTime = "09:00"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$batchPath = Join-Path $scriptDir "update-scholar-daily.bat"

if (-not (Test-Path $batchPath)) {
    throw "Missing batch script at $batchPath"
}

$taskAction = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batchPath`"" -WorkingDirectory $repoRoot
$taskTrigger = New-ScheduledTaskTrigger -Daily -At $StartTime
$taskSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 72)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Principal $principal -Force | Out-Null

Write-Host "Scheduled task '$TaskName' registered successfully."
Write-Host "Start time: $StartTime"
Write-Host "Repo root: $repoRoot"
Write-Host "Script: $batchPath"
