$ErrorActionPreference='Stop'
$Source=Split-Path -Parent $MyInvocation.MyCommand.Path
$Target='C:\ProgramData\DFAB\RndUsageAgent'
if (!(Test-Path (Join-Path $Source 'config.json'))) { throw 'Create config.json from config.example.json before installing.' }
New-Item -Path $Target -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $Source 'RndUsageAgent.ps1') $Target -Force
Copy-Item (Join-Path $Source 'config.json') $Target -Force
$Action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Target\RndUsageAgent.ps1`""
$Trigger=New-ScheduledTaskTrigger -AtLogOn
$Settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName 'DFAB R&D Usage Agent' -Action $Action -Trigger $Trigger -Settings $Settings -Description 'Transparent R&D system usage timesheet agent' -Force | Out-Null
Start-ScheduledTask -TaskName 'DFAB R&D Usage Agent'
Write-Host 'DFAB R&D Usage Agent installed and started.' -ForegroundColor Green
