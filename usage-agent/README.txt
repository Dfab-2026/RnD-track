DFAB R&D LOCAL USAGE AGENT — KABIL

PURPOSE
Tracks the usage information needed in Timesheet: foreground application time, idle time, and active Chrome/Edge website domains. Timesheet usage does NOT require Firebase CLI, Firebase login, Firestore rule deployment, or Windows Task Scheduler.

INSTALL (EASY)
1. Open a normal PowerShell window. Administrator mode is not required.
2. cd "D:\DFAB PROJECT\KPI R&D\usage-agent"
3. Set-ExecutionPolicy -Scope Process Bypass
4. .\Prepare-Kabil-Agent.ps1
5. .\Install-Agent.ps1
6. Verify: Invoke-RestMethod http://127.0.0.1:8765/health
7. Chrome: chrome://extensions -> Developer mode -> Load unpacked -> select usage-agent\browser-extension.
8. Edge: edge://extensions -> Load unpacked -> select the same folder only if Edge is used.
9. Open R&D Dashboard -> Timesheet -> Refresh.

WHAT IT TRACKS
- Foreground application name and active duration.
- Idle duration after 5 minutes with no keyboard/mouse input.
- Active Chrome/Edge website domain every 30 seconds through the extension.
- Installed data folder: %LOCALAPPDATA%\DFAB\RndUsageAgent
- Local data file: %LOCALAPPDATA%\DFAB\RndUsageAgent\usage-events.jsonl
- Log file: %LOCALAPPDATA%\DFAB\RndUsageAgent\agent.log
- Local API: http://127.0.0.1:8765/usage
- Auto-start: HKCU\Software\Microsoft\Windows\CurrentVersion\Run

IMPORTANT
The existing Firebase connection for KPI, Daily Ideas, Weekly Tasks, Work Tracking, chat and other application data is unchanged. This local mode only replaces the Timesheet usage upload dependency.

UNINSTALL
Run .\Uninstall-Agent.ps1 from a normal PowerShell window.
