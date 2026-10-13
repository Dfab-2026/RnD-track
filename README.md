# R&D Track v9

Static HTML/CSS/JavaScript R&D idea, weekly execution and KPI tracker.

## Cloud architecture
- Cloud Firestore: shared source of truth for members, ideas, weekly cycles, projects and progress entries.
- IndexedDB: offline cache and local attachment bytes.
- Firebase Anonymous Auth: background client authentication.
- Realtime listeners: all open browsers receive shared data changes.

## Compact Firestore schema
v9 stores normalized compact documents in Firestore:
- short field names in cloud only (the UI still uses readable names)
- document IDs are not duplicated inside document data
- timestamps are stored as numbers instead of ISO text
- derived display names are not duplicated
- blank fields are omitted
- attachment binary/base64 is never stored in Firestore
- only changed records are written instead of rewriting all collections
- older verbose Firestore documents are migrated automatically when loaded

All form text/data is persisted in Firestore. Attachment bytes remain in IndexedDB because Firebase Storage requires the Blaze plan for this project; only small attachment metadata is stored in Firestore.

## Deploy update
When patching an existing configured deployment, keep your existing `firebase-config.js` and replace:
- index.html
- app.js
- firebase-cloud.js
- styles.css
- vercel.json

Then push to GitHub/Vercel.

## v10 protected Firebase config
`firebase-config.js` is intentionally not bundled in update packages. Keep the configured file already deployed in your repository/project root. Future patches update UI/application files only. A template is provided as `firebase-config.example.js` for first-time setup.

## V11 professional reconstruction
- Rebuilt dashboard, Daily Ideas, Weekly Tasks, Progress Tracker, Analytics and Settings presentation.
- Added same-page edit actions for ideas, working weeks, projects, progress logs and members.
- Edits keep the original record IDs and save through the existing IndexedDB + Firestore sync path.
- firebase-config.js remains protected and is never included in patch ZIPs.
