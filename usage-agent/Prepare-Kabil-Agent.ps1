$ErrorActionPreference='Stop'
$AgentRoot=Split-Path -Parent $MyInvocation.MyCommand.Path
$Config=[ordered]@{MemberId=1;MemberName='Kabil';DeviceId=$env:COMPUTERNAME;IdleThresholdSeconds=300;PollSeconds=10;LocalPort=8765}
$Config|ConvertTo-Json|Set-Content (Join-Path $AgentRoot 'config.json') -Encoding UTF8
"self.USAGE_CONFIG={memberId:1,memberName:'Kabil',deviceId:'$($env:COMPUTERNAME)',localEndpoint:'http://127.0.0.1:8765/browser'};"|Set-Content (Join-Path $AgentRoot 'browser-extension\config.js') -Encoding UTF8
Write-Host "Kabil usage agent configured for $($env:COMPUTERNAME). No Firebase CLI is required for Timesheet usage." -ForegroundColor Green
