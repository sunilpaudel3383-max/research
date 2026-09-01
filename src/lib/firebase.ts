import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0090438026",
  appId: "1:382298507464:web:150ad0b3bf54cd4c317dfd",
  apiKey: "AIzaSyB4CGm1UZpKdTiE_uDMgGwY01BctuI3kK4",
  authDomain: "gen-lang-client-0090438026.firebaseapp.com",
  storageBucket: "gen-lang-client-0090438026.firebasestorage.app",
  messagingSenderId: "382298507464",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app for admin creating users without signing out
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
