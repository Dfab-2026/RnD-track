$ErrorActionPreference='Stop'
$AgentRoot=Split-Path -Parent $MyInvocation.MyCommand.Path
$FirebasePath=Join-Path (Split-Path -Parent $AgentRoot) 'firebase-config.js'
if (!(Test-Path $FirebasePath)) { throw 'firebase-config.js was not found beside the usage-agent folder.' }
$Source=Get-Content $FirebasePath -Raw
$ApiKey=[regex]::Match($Source,'apiKey\s*:\s*["'']([^"'']+)["'']').Groups[1].Value
$ProjectId=[regex]::Match($Source,'projectId\s*:\s*["'']([^"'']+)["'']').Groups[1].Value
if (!$ApiKey -or !$ProjectId -or $ApiKey -like 'PASTE_*' -or $ProjectId -like 'PASTE_*') { throw 'Replace firebase-config.js with the deployed Firebase config first.' }
$Config=[ordered]@{ApiKey=$ApiKey;ProjectId=$ProjectId;MemberId=1;MemberName='Kabil';DeviceId='DFAB-PC22';IdleThresholdSeconds=300;PollSeconds=10}
$Config|ConvertTo-Json|Set-Content (Join-Path $AgentRoot 'config.json') -Encoding UTF8
$SafeApi=$ApiKey.Replace("'","\'");$SafeProject=$ProjectId.Replace("'","\'")
"self.USAGE_CONFIG={apiKey:'$SafeApi',projectId:'$SafeProject',memberId:1,memberName:'Kabil',deviceId:'DFAB-PC22'};"|Set-Content (Join-Path $AgentRoot 'browser-extension\config.js') -Encoding UTF8
Write-Host 'Kabil / DFAB-PC22 agent and Chrome/Edge extension configured.' -ForegroundColor Green
