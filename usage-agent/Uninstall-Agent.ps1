$ErrorActionPreference='SilentlyContinue'
Stop-ScheduledTask -TaskName 'DFAB R&D Usage Agent'
Unregister-ScheduledTask -TaskName 'DFAB R&D Usage Agent' -Confirm:$false
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'"|Where-Object{$_.CommandLine -like '*RndUsageAgent.ps1*'}|Invoke-CimMethod -MethodName Terminate|Out-Null
Write-Host 'DFAB R&D Usage Agent stopped and removed from startup.' -ForegroundColor Yellow
