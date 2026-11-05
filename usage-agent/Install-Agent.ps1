$ErrorActionPreference='Stop'
$Source=Split-Path -Parent $MyInvocation.MyCommand.Path
$Target=Join-Path $env:LOCALAPPDATA 'DFAB\RndUsageAgent'
if (!(Test-Path (Join-Path $Source 'config.json'))) { throw 'Run Prepare-Kabil-Agent.ps1 before installing.' }

New-Item -Path $Target -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $Source 'RndUsageAgent.ps1') $Target -Force
Copy-Item (Join-Path $Source 'config.json') $Target -Force

$PowerShellExe="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
if(!(Test-Path $PowerShellExe)){throw "Windows PowerShell was not found at $PowerShellExe"}
$InstalledScript=Join-Path $Target 'RndUsageAgent.ps1'
$StartupCommand="`"$PowerShellExe`" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$InstalledScript`""
$RunKey='HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
New-Item -Path $RunKey -Force | Out-Null
Set-ItemProperty -Path $RunKey -Name 'DFAB R&D Usage Agent' -Value $StartupCommand -Force

# Stop an older copy, then launch the freshly installed agent.
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*RndUsageAgent.ps1*' -and $_.ProcessId -ne $PID } |
  ForEach-Object { Invoke-CimMethod -InputObject $_ -MethodName Terminate -ErrorAction SilentlyContinue | Out-Null }

Start-Process -FilePath $PowerShellExe -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$InstalledScript)
Start-Sleep -Seconds 2

try {
  $Health=Invoke-RestMethod 'http://127.0.0.1:8765/health' -TimeoutSec 3
  Write-Host "DFAB R&D Usage Agent installed and running for $($Health.member_name) on $($Health.device_id)." -ForegroundColor Green
  Write-Host 'Local dashboard endpoint: http://127.0.0.1:8765/health' -ForegroundColor Cyan
} catch {
  Write-Host 'Agent files and Windows Startup entry were installed, but the health check did not respond.' -ForegroundColor Yellow
  Write-Host "Run this to see any startup error: & `"$PowerShellExe`" -NoProfile -ExecutionPolicy Bypass -File `"$InstalledScript`"" -ForegroundColor Yellow
  throw
}
