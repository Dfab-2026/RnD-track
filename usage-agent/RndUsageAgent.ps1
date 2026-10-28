$ErrorActionPreference = 'Stop'
$AgentRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $AgentRoot 'config.json'
$LogPath = Join-Path $AgentRoot 'agent.log'
if (!(Test-Path $ConfigPath)) { throw 'config.json is missing; copy and complete config.example.json first.' }
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
foreach ($Name in 'ApiKey','ProjectId','MemberId','MemberName','DeviceId') { if (!$Config.$Name -or [string]$Config.$Name -like 'PASTE_*') { throw "Invalid $Name in config.json" } }
$PollSeconds = [Math]::Max(5,[int]$Config.PollSeconds)
$IdleThreshold = [Math]::Max(60,[int]$Config.IdleThresholdSeconds)

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

function Write-AgentLog([string]$Message) { Add-Content -Path $LogPath -Value "$(Get-Date -Format s) $Message" -Encoding UTF8 }
function Get-AppName([string]$ProcessName) {
  $Map=@{chrome='Google Chrome';msedge='Microsoft Edge';excel='Microsoft Excel';winword='Microsoft Word';powerpnt='Microsoft PowerPoint';outlook='Microsoft Outlook';code='Visual Studio Code';acad='AutoCAD';teams='Microsoft Teams';whatsapp='WhatsApp';explorer='File Explorer'}
  if ($Map.ContainsKey($ProcessName)) { return $Map[$ProcessName] }
  if (!$ProcessName) { return 'Unknown' }
  return (Get-Culture).TextInfo.ToTitleCase($ProcessName)
}
function Get-Token {
  $Uri="https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$($Config.ApiKey)"
  return Invoke-RestMethod -Method Post -Uri $Uri -ContentType 'application/json' -Body '{"returnSecureToken":true}'
}
function Firestore-String([string]$Value) { return @{stringValue=[string]$Value} }
function Firestore-Integer([long]$Value) { return @{integerValue=[string]$Value} }
function Get-DocumentId([string]$Value) {
  $Bytes=[Text.Encoding]::UTF8.GetBytes($Value);$Hash=[Security.Cryptography.SHA256]::Create().ComputeHash($Bytes)
  return (($Hash|ForEach-Object{$_.ToString('x2')}) -join '').Substring(0,32)
}
function Send-Event($Event) {
  if (!$script:Token -or (Get-Date) -ge $script:TokenExpiry) { $Auth=Get-Token;$script:Token=$Auth.idToken;$script:TokenExpiry=(Get-Date).AddSeconds([Math]::Max(300,[int]$Auth.expiresIn-120)) }
  $Key="$($Config.DeviceId)|system|$($Event.Start)|$($Event.App)|$($Event.Process)";$DocumentId=Get-DocumentId $Key
  $Fields=@{m=Firestore-Integer ([long]$Config.MemberId);n=Firestore-String $Config.MemberName;v=Firestore-String $Config.DeviceId;d=Firestore-String $Event.Date;s=Firestore-Integer $Event.Start;e=Firestore-Integer $Event.End;a=Firestore-String $Event.App;p=Firestore-String $Event.Process;x=Firestore-Integer $Event.Active;i=Firestore-Integer $Event.Idle;q=Firestore-String 's';u=Firestore-Integer ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())}
  $Body=@{fields=$Fields}|ConvertTo-Json -Depth 8 -Compress;$Uri="https://firestore.googleapis.com/v1/projects/$($Config.ProjectId)/databases/(default)/documents/usage_events/$DocumentId"
  try { Invoke-RestMethod -Method Patch -Uri $Uri -Headers @{Authorization="Bearer $script:Token"} -ContentType 'application/json' -Body $Body | Out-Null }
  catch { $script:Token=$null;throw }
}

$Buckets=@{};$script:Token=$null;$script:TokenExpiry=Get-Date
Write-AgentLog "Started member=$($Config.MemberName) device=$($Config.DeviceId) idle=$IdleThreshold"
while ($true) {
  try {
    $Now=Get-Date;$Minute=[DateTimeOffset]::new($Now.Year,$Now.Month,$Now.Day,$Now.Hour,$Now.Minute,0,$Now.Offset);$Start=$Minute.ToUnixTimeMilliseconds();$IdleSeconds=[UsageNative]::IdleSeconds();$IsIdle=$IdleSeconds -ge $IdleThreshold
    $ProcessName='Unknown';try{$ProcessName=(Get-Process -Id ([UsageNative]::ForegroundProcessId()) -ErrorAction Stop).ProcessName.ToLowerInvariant()}catch{}
    $App=Get-AppName $ProcessName;$Key="$Start|$ProcessName";if(!$Buckets.ContainsKey($Key)){$Buckets[$Key]=[ordered]@{Date=$Now.ToString('yyyy-MM-dd');Start=$Start;End=$Start;App=$App;Process=$ProcessName;Active=0;Idle=0}}
    $Buckets[$Key].End=[DateTimeOffset]::Now.ToUnixTimeMilliseconds();if($IsIdle){$Buckets[$Key].Idle+=$PollSeconds}else{$Buckets[$Key].Active+=$PollSeconds}
    @($Buckets.Keys)|Where-Object{-not $_.StartsWith("$Start|")}|ForEach-Object{$Event=$Buckets[$_];Send-Event $Event;$Buckets.Remove($_)}
  } catch { Write-AgentLog "ERROR $($_.Exception.Message)" }
  Start-Sleep -Seconds $PollSeconds
}
