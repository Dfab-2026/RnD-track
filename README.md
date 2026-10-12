# R&D TRACK — Firebase-ready shared database build

This version preserves the existing R&D workflow and adds optional Firebase shared storage without API routes.

## Preserved workflow
- Name login with remembered session until logout
- Addable members
- R&D Member and Admin / Visitor roles
- Fixed departments: Production, NPD, R&D, Marketing, Purchase, Accounts, Quality, RFQ
- Daily idea entry
- Exactly 2 weekly shortlisted ideas
- Weekly projects
- Daily progress + remarks/blockers/next action
- Daily/weekly reports
- Browser notifications
- Backup/restore

## New shared-data architecture
- Cloud Firestore: shared structured data
- Cloud Storage: attachments
- Anonymous Firebase Auth: background SDK authentication while keeping the visible name-only login
- IndexedDB: offline cache/fallback
- Real-time cross-browser refresh
- Image compression before Storage upload

## Before Firebase is configured
The site still works locally using IndexedDB exactly like the previous version.

## To enable shared Firebase data
Follow `FIREBASE-SETUP.md` and fill `firebase-config.js`.

## Start locally
Double-click `START-KPI.bat`, or:

```powershell
py -m http.server 3000
```

Then open http://localhost:3000
