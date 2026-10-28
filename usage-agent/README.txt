DFAB R&D USAGE AGENT — KABIL / DFAB-PC22

1. Retain the deployed site's real firebase-config.js in the full project folder.
2. Deploy the included firestore.rules before installing the agent.
3. Open PowerShell as Administrator and run: Set-ExecutionPolicy -Scope Process Bypass
4. Run: .\Prepare-Kabil-Agent.ps1
5. Run: .\Install-Agent.ps1
6. In Chrome open chrome://extensions, enable Developer mode, choose Load unpacked and select browser-extension.
7. In Edge use edge://extensions and load the same folder only if Edge is used later.
8. Wait two minutes, then open R&D Dashboard > Timesheet and press Refresh.
9. Logs are stored at C:\ProgramData\DFAB\RndUsageAgent\agent.log.
10. Uninstall with an Administrator PowerShell: .\Uninstall-Agent.ps1
