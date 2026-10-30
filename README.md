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

## v158 hourly Time Sheet reminders
- R&D, Quality, and Production active workflows now trigger a Time Sheet reminder once per user per hour during 09:00-17:59, Monday-Saturday.
- R&D and Quality reminders work from any page in their active department, not only when the Time Sheet is already open.
- The reminder opens the correct department Time Sheet directly.
- If Chrome notifications are enabled, a desktop Time Sheet reminder is also sent.
- Reminder keys are isolated by department, user, date, and hour to prevent duplicate prompts in the same hour.

## v181 — Company-wide department KPI workspaces

R&D and Quality keep their existing dedicated workflows. Production, NPD, RFQ, Outsourcing, Purchase, Stores, HR & Admin, Accounts, Finance, Maintenance, and Digital Marketing now open a shared department workspace with Dashboard, Kaizen Ideas, Weekly Report, KPI Report, Time Sheet, and Settings.

Department KPI definitions follow KPI-Master.pptx. New department records use the existing Firestore `app_meta` collection with a per-department `kind` namespace and server read-back verification. This keeps all departments in the same Firebase database while preventing cross-department record mixing.

Production's existing project-based Time Sheet remains accessible from the Production department Time Sheet page.

## v182 — Quality-reference workspaces for all non-R&D departments
R&D remains on its dedicated workflow. Quality remains on its dedicated workflow. Production, NPD, RFQ, Outsourcing, Purchase, Stores, HR & Admin, Accounts, Finance, Maintenance and Digital Marketing now use the Quality reference structure for Dashboard, Kaizen Ideas, Weekly Report, KPI Report, Time Sheet and Settings. Each department keeps isolated Firebase records in the existing app_meta collection through the department_<key>_record namespace, with server read-back verification. The compact department encoder now persists task_type, custom_task and Kaizen benefit fields as well.

## Admin name-only access (v186)
- Department cards screen Admin uses the same name-only login-card style as existing logins.
- Authorized all-department admins: Kabil, Suresh Kumar, Pramod Kumar.
- Wrong names are rejected with `Wrong / Not authorized`.
- Admin session persists until Admin Logout and remains view-only.
- R&D and Quality keep their existing member logins.
- Shared department member allowlists are intentionally empty until approved names are supplied; arbitrary names cannot open those departments.


## v188
- Quality Time Sheet Daily inspection task split into Incoming Inspection, In-Process Inspection, and Final Inspection.
- Admin direct-dashboard bypass applies to Quality and shared departments; R&D retains its dedicated login/session flow.

## v189 - All Departments Leaders + Firebase Audit
- Kabil, Suresh Kumar and Pramod Kumar are company-level leaders for Quality and all shared non-R&D departments.
- Leader session still bypasses department member login and opens dashboards directly.
- Leaders can Save/Edit/Delete in Quality and shared department workspaces; R&D keeps its separate existing authorization flow.
- Generic department records persist actor_role, actor_scope, actor_name and department_key in compact data and audit metadata.
- Quality writes persist an audit envelope with actor, role, scope and department.
- All affected saves still flush Firebase pending writes and verify the saved document with a server-source read-back before success.


## v192 Leader KPI exact-source update
- KPI Control no longer uses a separate company-average KPI renderer for shared departments.
- Department selector renders the same KPI card fields, period keys, Firebase IDs and PDF model as each department KPI page.
- Quality routes to its existing dedicated KPI component so its ISO/training/manual KPI logic remains single-source.
- R&D remains on its existing separate KPI flow.
- Time Summary and Analytics continue to read the same Quality/department Time Sheet and KPI Firebase records; no duplicate analytics collections were introduced.
