// Firebase web configuration.
// Replace placeholder values with Firebase Console -> Project settings -> Your apps -> Web app.
// This browser config is not a secret; Firebase Security Rules protect the data.
globalThis.RND_FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Firebase Cloud Messaging -> Web Push certificates -> Key pair -> public VAPID key.
globalThis.RND_FIREBASE_PUSH_CONFIG = {
  vapidKey: "PASTE_WEB_PUSH_VAPID_PUBLIC_KEY"
};
