# R&D Track v19 — Reconstructed Work Tracking + Analytics

This build reconstructs only Work Tracking and Analytics on top of the stable v17 Firebase/login baseline. All existing idea, weekly assignment, settings, member, Firebase sync and persistence flows are preserved.

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


## v15 stability and speed update
- Optimistic UI rendering for create/edit/delete actions.
- Firestore writes and deletes continue in the background after local persistence.
- Pending-delete tombstones prevent deleted records from reappearing during realtime sync.
- Firestore is authoritative when cloud data exists; IndexedDB is the offline cache.
- Realtime collection events are debounced and duplicate snapshots are ignored.
- Removed full app reloads after weekly assignment and progress mutations.
- Mutation buttons are guarded against double-clicks and surface errors cleanly.


## v16 login/render stabilization
- Restores remembered member immediately from local storage on refresh/reopen.
- Firebase synchronization now starts in the background after the saved session is shown.
- Restored missing Analytics renderer that caused `renderAnalyticsOverview is not defined`.
- Startup/render errors no longer clear a valid remembered login.
- Login is cleared only by the explicit Settings → Log out action or member deactivation logic where applicable.


## v17 render hardening
- Removed the old renderAnalyticsOverview symbol entirely.
- Analytics rendering is isolated so it cannot block login/app startup.
- Asset version 17.0.1 and no-cache Vercel headers prevent mixed deployments.
- Existing Firebase configuration and tracker flows remain unchanged.

## v21 — Excel-style Analytics Project Tracker

Analytics now includes a spreadsheet-style project control matrix. Each project is one row, with sticky identity columns and date-by-date progress columns. Click a row to inspect the full daily work log (work done, remarks, blockers, next action). Search, week/status filters and Excel-compatible CSV export are included. Existing Firebase realtime sync, weekly backlog assignment, login and Work Tracking flows are unchanged.


## v27 Work Tracking period navigation
Work Tracking now inherits the active month from Daily Ideas / Weekly Tasks and lets the user switch Week 1–4 from a compact header control. Other application flows are unchanged.
