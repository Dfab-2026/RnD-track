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

## Fixed login roster (v10)

The team roster is intentionally fixed to exactly five logins:

- 4 R&D Member slots
- 1 Admin / Visitor slot

Only names are editable in Settings. Roles and slot count are fixed. Renaming a slot preserves its member ID, so historical ideas, weekly assignments and progress remain linked to the same person. Duplicate names are rejected. Existing duplicate member documents are consolidated during Firebase startup and obsolete member documents are removed after references are repaired.


## v11 Settings update
- Departments and login management are shown side-by-side on desktop.
- Members and visitors can be added, renamed, role-changed, and removed from active login access.
- Duplicate names are blocked; re-adding a deleted name restores the same member ID.
- Delete is non-destructive for history: old ideas/projects/progress remain linked.
- Chrome notification permission is handled by the browser, so there is no notification settings card.
- Firebase test controls were removed from Settings; cloud status remains visible in the header.


## v14 record controls
- Edit and × Delete for ideas, weeks, projects, progress updates, and logins.
- Deletes are dependency-aware and synchronized to Firestore.
- Fixed departments remain protected.
