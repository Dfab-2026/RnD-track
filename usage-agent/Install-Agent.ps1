$ErrorActionPreference='Stop'
$Source=Split-Path -Parent $MyInvocation.MyCommand.Path
$Target='C:\ProgramData\DFAB\RndUsageAgent'
if (!(Test-Path (Join-Path $Source 'config.json'))) { throw 'Run Prepare-Kabil-Agent.ps1 before installing.' }
New-Item -Path $Target -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $Source 'RndUsageAgent.ps1') $Target -Force
Copy-Item (Join-Path $Source 'config.json') $Target -Force
$PowerShellExe="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
if(!(Test-Path $PowerShellExe)){throw "Windows PowerShell was not found at $PowerShellExe"}
$Action=New-ScheduledTaskAction -Execute $PowerShellExe -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Target\RndUsageAgent.ps1`""
$Trigger=New-ScheduledTaskTrigger -AtLogOn
$Settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'DFAB R&D Usage Agent' -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Local R&D app and browser usage tracker for the Timesheet dashboard' -Force | Out-Null
Start-ScheduledTask -TaskName 'DFAB R&D Usage Agent'
Start-Sleep -Seconds 2
$State=(Get-ScheduledTask -TaskName 'DFAB R&D Usage Agent').State
Write-Host "DFAB R&D Usage Agent installed. Task state: $State" -ForegroundColor Green
Write-Host 'Local dashboard endpoint: http://127.0.0.1:8765/health' -ForegroundColor Cyan
