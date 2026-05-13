import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoding the config to ensure it's correctly bundled and available
const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-69560",
  appId: "1:913891101451:web:9dbb8f913dccda0f77300e",
  apiKey: "AIzaSyBMzZueLHHpT7PcfxY263P-Mp_WfY_p0gU",
  authDomain: "ai-studio-applet-webapp-69560.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-c30ced94-f910-4918-828a-1007ea2919d6",
  storageBucket: "ai-studio-applet-webapp-69560.firebasestorage.app",
  messagingSenderId: "913891101451",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);

// Ensure we get the database ID from the config, defaulting to '(default)' if missing
const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

// Set persistence explicitly to local
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Auth persistence error:", err);
});

console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);

