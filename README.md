# R&D TRACK — Firebase shared database build v4

This build preserves the existing R&D workflow and fixes Firebase submission reliability.

## Core flow preserved
- Name-only member login with close-name suggestion
- Persistent login until Settings -> Logout
- Addable members and Admin / Visitor role
- Fixed departments: Production, NPD, R&D, Marketing, Purchase, Accounts, Quality, RFQ
- Daily idea entry
- Exactly 2 weekly shortlisted ideas
- Weekly projects and daily progress updates
- Daily / weekly reports
- Browser notifications
- Local backup / restore

## Firebase behavior
- Anonymous Firebase Auth runs in the background.
- Firestore is the shared database for members, ideas, cycles, projects and progress.
- Departments are a locked local master and are NOT written to Firestore.
- IndexedDB remains an offline/local cache.
- Attachments stay local on the browser in this Spark-plan build.
- Attachment base64 data is NEVER written into Firestore.
- Multiple devices receive Firestore updates through realtime listeners.

## Important v4 submission fix
The previous Firebase build attempted to write the locked `departments` collection. With production rules that reject department writes, that could make cloud saves fail. v4 no longer writes departments to Firestore.

The Firebase connection test now performs an allowed Firestore read instead of writing a `_system` document, so it works with the production rules already configured.

## No grammar/spelling assistance
Free-text fields set `spellcheck=false` and Grammarly-disable attributes. The website itself performs no grammar correction, rewriting or spell correction.

## Firebase config
Keep your existing configured `firebase-config.js` when updating an already-configured installation. If using this ZIP fresh, paste the Firebase Web App values into `firebase-config.js`.

## Run locally
Double-click `START-KPI.bat`, or serve the folder with:

```powershell
py -m http.server 3000
```

Open `http://localhost:3000`.

## Deploy
Firebase Hosting:

```powershell
firebase login
firebase init hosting
firebase deploy --only hosting
```

Firestore rules can be deployed separately with:

```powershell
firebase deploy --only firestore:rules
```
