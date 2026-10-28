$ErrorActionPreference = 'Stop'
$AgentRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $AgentRoot 'config.json'
$LogPath = Join-Path $AgentRoot 'agent.log'
$DataPath = Join-Path $AgentRoot 'usage-events.jsonl'
if (!(Test-Path $ConfigPath)) { throw 'config.json is missing; run Prepare-Kabil-Agent.ps1 first.' }
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
foreach ($Name in 'MemberId','MemberName','DeviceId') { if (!$Config.$Name) { throw "Invalid $Name in config.json" } }
$PollSeconds = if($Config.PollSeconds){[Math]::Max(5,[int]$Config.PollSeconds)}else{10}
$IdleThreshold = if($Config.IdleThresholdSeconds){[Math]::Max(60,[int]$Config.IdleThresholdSeconds)}else{300}
$Port = if($Config.LocalPort){[Math]::Max(1024,[int]$Config.LocalPort)}else{8765}

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class UsageNative {
  [StructLayout(LayoutKind.Sequential)] public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
  [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO value);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
  public static uint IdleSeconds() { var v=new LASTINPUTINFO(); v.cbSize=(uint)Marshal.SizeOf(v); return GetLastInputInfo(ref v)?((uint)Environment.TickCount-v.dwTime)/1000:0; }
  public static uint ForegroundProcessId() { uint id; GetWindowThreadProcessId(GetForegroundWindow(),out id); return id; }
}
'@

function Write-AgentLog([string]$Message) {
  try { Add-Content -Path $LogPath -Value "$(Get-Date -Format s) $Message" -Encoding UTF8 } catch {}
}
function Get-AppName([string]$ProcessName) {
  $Map=@{chrome='Google Chrome';msedge='Microsoft Edge';excel='Microsoft Excel';winword='Microsoft Word';powerpnt='Microsoft PowerPoint';outlook='Microsoft Outlook';code='Visual Studio Code';acad='AutoCAD';teams='Microsoft Teams';whatsapp='WhatsApp';explorer='File Explorer';notepad='Notepad';cmd='Command Prompt';powershell='Windows PowerShell';pwsh='PowerShell';taskmgr='Task Manager';msaccess='Microsoft Access';onenote='Microsoft OneNote';devenv='Visual Studio';figma_agent='Figma';figma='Figma'}
  if ($Map.ContainsKey($ProcessName)) { return $Map[$ProcessName] }
  if (!$ProcessName) { return 'Unknown' }
  return (Get-Culture).TextInfo.ToTitleCase($ProcessName)
}
function Save-Event($Event) {
  $SiteValue=if($Event.Site){[string]$Event.Site}else{''}
  $Row=[ordered]@{
    id = [Guid]::NewGuid().ToString('N')
    member_id = [int]$Config.MemberId
    member_name = [string]$Config.MemberName
    device_id = [string]$Config.DeviceId
    date = [string]$Event.Date
    started_at = [long]$Event.Start
    ended_at = [long]$Event.End
    app_name = [string]$Event.App
    process_name = [string]$Event.Process
    site_domain = $SiteValue
    active_seconds = [int]$Event.Active
    idle_seconds = [int]$Event.Idle
    source = [string]$Event.Source
  }
  ($Row | ConvertTo-Json -Compress) | Add-Content -Path $DataPath -Encoding UTF8
}
function Get-UsageRows([string]$From,[string]$To) {
  $Rows = New-Object System.Collections.Generic.List[object]
  if (Test-Path $DataPath) {
    Get-Content $DataPath -Encoding UTF8 | ForEach-Object {
      if ([string]::IsNullOrWhiteSpace($_)) { return }
      try {
        $Row = $_ | ConvertFrom-Json
        if ((!$From -or $Row.date -ge $From) -and (!$To -or $Row.date -le $To)) { $Rows.Add($Row) }
      } catch {}
    }
  }
  foreach ($Bucket in $Buckets.Values) {
    if ((!$From -or $Bucket.Date -ge $From) -and (!$To -or $Bucket.Date -le $To)) {
      $Rows.Add([pscustomobject]@{
        id='live-system';member_id=[int]$Config.MemberId;member_name=[string]$Config.MemberName;device_id=[string]$Config.DeviceId;date=$Bucket.Date;
        started_at=[long]$Bucket.Start;ended_at=[long]$Bucket.End;app_name=[string]$Bucket.App;process_name=[string]$Bucket.Process;site_domain='';
        active_seconds=[int]$Bucket.Active;idle_seconds=[int]$Bucket.Idle;source='system'
      })
    }
  }
  return $Rows
}
function UrlDecode([string]$Value) { if ($null -eq $Value) { return '' }; return [Uri]::UnescapeDataString(($Value -replace '\+',' ')) }
function Parse-Query([string]$Path) {
  $Result=@{};$Question=$Path.IndexOf('?');if($Question -lt 0){return $Result};$Query=$Path.Substring($Question+1)
  foreach($Part in $Query -split '&'){if(!$Part){continue};$Bits=$Part -split '=',2;$Result[(UrlDecode $Bits[0])] = if($Bits.Count -gt 1){UrlDecode $Bits[1]}else{''}}
  return $Result
}
function Send-HttpResponse($Client,[int]$Status,[string]$Body,[string]$ContentType='application/json') {
  try {
    $Bytes=[Text.Encoding]::UTF8.GetBytes($Body)
    $Reason = if($Status -eq 200){'OK'}elseif($Status -eq 204){'No Content'}elseif($Status -eq 404){'Not Found'}else{'Bad Request'}
    $Headers="HTTP/1.1 $Status $Reason`r`nContent-Type: $ContentType; charset=utf-8`r`nContent-Length: $($Bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Private-Network: true`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
    $HeaderBytes=[Text.Encoding]::ASCII.GetBytes($Headers);$Stream=$Client.GetStream();$Stream.Write($HeaderBytes,0,$HeaderBytes.Length);if($Bytes.Length){$Stream.Write($Bytes,0,$Bytes.Length)};$Stream.Flush()
  } catch {} finally { try{$Client.Close()}catch{} }
}
function Process-HttpClient($Client) {
  try {
    $Stream=$Client.GetStream();$Stream.ReadTimeout=1000;$Buffer=New-Object byte[] 65536;$Read=0;$Text=''
    do {$Count=$Stream.Read($Buffer,$Read,$Buffer.Length-$Read);if($Count -le 0){break};$Read+=$Count;$Text=[Text.Encoding]::UTF8.GetString($Buffer,0,$Read);$HeaderEnd=$Text.IndexOf("`r`n`r`n");if($HeaderEnd -ge 0){$HeaderText=$Text.Substring(0,$HeaderEnd);$Length=0;if($HeaderText -match '(?im)^Content-Length:\s*(\d+)\s*$'){$Length=[int]$Matches[1]};if($Read -ge $HeaderEnd+4+$Length){break}}}while($Read -lt $Buffer.Length)
    if(!$Text){Send-HttpResponse $Client 400 '{"error":"empty request"}';return}
    $HeaderEnd=$Text.IndexOf("`r`n`r`n");$Head=if($HeaderEnd -ge 0){$Text.Substring(0,$HeaderEnd)}else{$Text};$Body=if($HeaderEnd -ge 0){$Text.Substring($HeaderEnd+4)}else{''};$Lines=$Head -split "`r`n";$Request=$Lines[0] -split ' ';$Method=$Request[0];$Path=$Request[1]
    if($Method -eq 'OPTIONS'){Send-HttpResponse $Client 204 '';return}
    if($Method -eq 'GET' -and $Path.StartsWith('/health')){Send-HttpResponse $Client 200 (([ordered]@{ok=$true;member_id=[int]$Config.MemberId;member_name=$Config.MemberName;device_id=$Config.DeviceId;port=$Port;started=$script:StartedAt} | ConvertTo-Json -Compress));return}
    if($Method -eq 'GET' -and $Path.StartsWith('/usage')){$Q=Parse-Query $Path;$Rows=Get-UsageRows $Q['from'] $Q['to'];Send-HttpResponse $Client 200 (@($Rows) | ConvertTo-Json -Depth 6 -Compress);return}
    if($Method -eq 'POST' -and $Path.StartsWith('/browser')){
      try{$Payload=$Body|ConvertFrom-Json}catch{Send-HttpResponse $Client 400 '{"error":"invalid json"}';return}
      $Domain=([string]$Payload.site_domain).Trim().ToLowerInvariant() -replace '^www\.','';if(!$Domain){Send-HttpResponse $Client 400 '{"error":"site_domain required"}';return}
      $Now=[DateTimeOffset]::Now.ToUnixTimeMilliseconds();$Seconds=if($Payload.active_seconds){[Math]::Max(1,[Math]::Min(60,[int]$Payload.active_seconds))}else{30};$Date=(Get-Date).ToString('yyyy-MM-dd');$Browser=if([string]$Payload.app_name){[string]$Payload.app_name}else{'Google Chrome'};$Proc=if($Browser -like '*Edge*'){'msedge'}else{'chrome'}
      $BrowserStart=if($Payload.started_at){[long]$Payload.started_at}else{[long]($Now-($Seconds*1000))};$BrowserEnd=if($Payload.ended_at){[long]$Payload.ended_at}else{[long]$Now}
      Save-Event ([ordered]@{Date=$Date;Start=$BrowserStart;End=$BrowserEnd;App=$Browser;Process=$Proc;Site=$Domain;Active=$Seconds;Idle=0;Source='browser'})
      Send-HttpResponse $Client 200 '{"ok":true}';return
    }
    Send-HttpResponse $Client 404 '{"error":"not found"}'
  } catch { Write-AgentLog "HTTP ERROR $($_.Exception.Message)";try{Send-HttpResponse $Client 400 '{"error":"request failed"}'}catch{} }
}

$Buckets=@{};$script:StartedAt=(Get-Date -Format s)
$Listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$Port)
$Listener.Start();$NextSample=Get-Date
Write-AgentLog "Started member=$($Config.MemberName) device=$($Config.DeviceId) idle=$IdleThreshold port=$Port local-mode=true"
while ($true) {
  try {
    while($Listener.Pending()){$Client=$Listener.AcceptTcpClient();Process-HttpClient $Client}
    $Now=Get-Date
    if($Now -ge $NextSample){
      $Offset=[DateTimeOffset]::Now.Offset;$Minute=[DateTimeOffset]::new($Now.Year,$Now.Month,$Now.Day,$Now.Hour,$Now.Minute,0,$Offset);$Start=$Minute.ToUnixTimeMilliseconds();$IdleSeconds=[UsageNative]::IdleSeconds();$IsIdle=$IdleSeconds -ge $IdleThreshold
      $ProcessName='Unknown';try{$ProcessName=(Get-Process -Id ([UsageNative]::ForegroundProcessId()) -ErrorAction Stop).ProcessName.ToLowerInvariant()}catch{}
      $App=Get-AppName $ProcessName;$Key="$Start|$ProcessName";if(!$Buckets.ContainsKey($Key)){$Buckets[$Key]=[ordered]@{Date=$Now.ToString('yyyy-MM-dd');Start=$Start;End=$Start;App=$App;Process=$ProcessName;Site='';Active=0;Idle=0;Source='system'}}
      $Buckets[$Key].End=[DateTimeOffset]::Now.ToUnixTimeMilliseconds();if($IsIdle){$Buckets[$Key].Idle+=$PollSeconds}else{$Buckets[$Key].Active+=$PollSeconds}
      @($Buckets.Keys)|Where-Object{-not $_.StartsWith("$Start|")}|ForEach-Object{$Event=$Buckets[$_];Save-Event $Event;$Buckets.Remove($_)}
      $NextSample=$Now.AddSeconds($PollSeconds)
    }
  } catch { Write-AgentLog "ERROR $($_.Exception.Message)" }
  Start-Sleep -Milliseconds 200
}
