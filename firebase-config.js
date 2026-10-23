// R&D TRACK Firebase Web configuration.
// IMPORTANT: this file must contain the real Web App config for project dfab-rnd-track.
// Run SETUP-FIREBASE.bat once from this folder to fetch/write it automatically.
//
// If a previously configured build saved a config in localStorage, reuse it.
(function(){
  try{
    const saved=localStorage.getItem('rnd_firebase_config');
    if(saved){
      const parsed=JSON.parse(saved);
      if(parsed && parsed.apiKey && parsed.projectId && parsed.appId){
        window.RND_FIREBASE_CONFIG=parsed;
        return;
      }
    }
  }catch(e){}
  window.RND_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAbArRptyHA6u9KY-sQ24kRDYEhCXCznv4",
  authDomain: "dfab-rnd-track.firebaseapp.com",
  projectId: "dfab-rnd-track",
  storageBucket: "dfab-rnd-track.firebasestorage.app",
  messagingSenderId: "170289873748",
  appId: "1:170289873748:web:d0196b9f911d3c2b913ec1"
  };
})();
