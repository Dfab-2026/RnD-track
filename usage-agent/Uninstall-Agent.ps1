$ErrorActionPreference='SilentlyContinue'
$RunKey='HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
Remove-ItemProperty -Path $RunKey -Name 'DFAB R&D Usage Agent' -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'"|Where-Object{$_.CommandLine -like '*RndUsageAgent.ps1*' -and $_.ProcessId -ne $PID}|Invoke-CimMethod -MethodName Terminate|Out-Null
$Target=Join-Path $env:LOCALAPPDATA 'DFAB\RndUsageAgent'
Remove-Item $Target -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'DFAB R&D Usage Agent stopped and removed from Windows Startup.' -ForegroundColor Yellow
