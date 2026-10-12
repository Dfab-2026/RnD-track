# Firebase setup for R&D TRACK

## 1. Create the project
1. Open Firebase Console and choose **Create a project**.
2. Name it something like `dfab-rnd-track`.
3. Google Analytics is optional for this internal tracker.

## 2. Register the web app
1. Project Overview -> click the **Web (</>)** icon.
2. App nickname: `R&D TRACK Web`.
3. Register app.
4. Firebase displays a `firebaseConfig` object.
5. Open `firebase-config.js` in this folder and replace every `PASTE_...` value with the values Firebase gives you.

Do not add a service-account private key to this website. The normal Firebase Web config is intended to be present in client code. Security must be enforced with Firebase rules.

## 3. Create Cloud Firestore
1. Firebase Console -> **Build / Firestore Database**.
2. Click **Create database**.
3. Select **Standard edition**.
4. Pick a region close to the company/users. Do not casually change regions later.
5. Start with locked/production rules, then paste the contents of `firestore.rules` into the Firestore Rules editor and publish.

The site creates these collections automatically when first used:
- `members`
- `departments`
- `ideas`
- `cycles`
- `projects`
- `progress`
- `_system` (connection health check only)

## 4. Enable Firebase Authentication
The visible login remains name-only as requested. Firebase Authentication is used invisibly underneath so Firestore/Storage can reject completely unauthenticated requests.

1. Firebase Console -> **Build / Authentication**.
2. Click **Get started**.
3. Open **Sign-in method**.
4. Enable **Anonymous** authentication.

Important: a name-only login is convenient but is not strong identity security. Anyone who can access the deployed site can potentially create an anonymous Firebase session. For confidential company data, upgrade later to email/PIN or another real authentication method.

## 5. Enable Cloud Storage (for attachments)
1. Firebase Console -> **Build / Storage**.
2. Click **Get started** and create the bucket.
3. Publish the contents of `storage.rules` in the Storage Rules editor.

Current Firebase requirements may require the **Blaze** billing plan for newly created Cloud Storage buckets. Firestore itself can still use its free quota, but attachment uploads need Storage to be available on the project.

The app stores attachments under:
- `rnd-track/ideas/...`
- `rnd-track/progress/...`

Images are resized to a maximum dimension of 1600 px and converted to WebP around 72% quality before upload; quality is stepped down further for large images. Firestore stores only attachment metadata and the Storage URL/path, never base64 file contents.

## 6. Deploy the rules with Firebase CLI (optional but recommended)
If Node.js is installed:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage
```

## 7. Deploy the static website with Firebase Hosting (optional)
From this folder:

```powershell
firebase init hosting
```

Choose the existing Firebase project. Use the current folder (`.`) as the public directory, do not overwrite `index.html`, then:

```powershell
firebase deploy --only hosting
```

You can also deploy the same folder to Vercel/Netlify; Firebase remains only the shared database/storage layer.

## 8. First migration from the current local tracker
If this browser already contains your IndexedDB data, configure Firebase and reload this new version. When Firebase is empty, the site uploads the existing local snapshot into the normalized Firebase collections automatically.

After that:
- Firestore becomes the shared cloud source.
- IndexedDB remains an offline/local cache.
- Other PCs connected to the same Firebase project see updates through real-time listeners.

## 9. Verify
Open **Settings -> Firebase Cloud Sync**.
You should see `Connected · shared Firebase database`.
Click **Test Firebase connection**.

Then test with two browsers/PCs:
1. Login as different saved members.
2. Submit an idea on PC 1.
3. Confirm it appears on PC 2.
4. Create a week and shortlist exactly two ideas.
5. Add progress and confirm it appears on both devices.

## Storage strategy used by this build
- Firestore: compact structured text/numeric records only.
- Cloud Storage: attachment binary files only.
- IndexedDB: offline cache/fallback.
- Empty fields and derived display-name fields are omitted from Firestore.
- Images are compressed client-side before upload.
- Original PDFs/docs are stored in Cloud Storage rather than encoded inside Firestore.
- Firestore data is separated by record instead of one ever-growing document, avoiding the 1 MiB document-size ceiling.
