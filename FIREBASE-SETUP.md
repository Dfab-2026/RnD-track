# Firebase setup — R&D TRACK v4

## Required services
1. Firebase Web App
2. Authentication -> Anonymous enabled
3. Cloud Firestore -> Standard edition, Production mode

Firebase Storage is NOT required for this build. Attachments remain local so Spark-plan users can submit ideas without Storage/Blaze blocking the workflow.

## 1. Web config
Paste the values Firebase gives you into `firebase-config.js`.

Keep all values inside quotes.

## 2. Authentication
Firebase Console -> Authentication -> Sign-in method -> Anonymous -> Enable.

The visible website login remains the saved member-name flow.

## 3. Firestore
Create the default Firestore database in Production mode.

Open Firestore -> Rules and use `firestore.rules` from this folder, then Publish.

Collections written by the current app:
- `members`
- `ideas`
- `cycles`
- `projects`
- `progress`

The eight departments are fixed in the website and are not written to Firestore.

## 4. Test
Open the website -> Settings -> Firebase Cloud Sync -> Test Firebase connection.

Expected message:
`Firebase connection is working.`

Then submit one idea on PC/browser 1 and confirm it appears on PC/browser 2 using the same Firebase project.

## 5. Existing configured installation
If you already entered your real Firebase keys, keep your current `firebase-config.js` and replace the other updated site files. Do not replace it with the placeholder config from a fresh ZIP.

## 6. Hosting
Firebase Hosting:

```powershell
firebase login
firebase init hosting
firebase deploy --only hosting
```

For Firestore rules:

```powershell
firebase deploy --only firestore:rules
```
