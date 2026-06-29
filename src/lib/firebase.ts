import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0803482873",
  appId: "1:729143765180:web:247e34b0b0f2b21c9c88b9",
  apiKey: "AIzaSyC5sIJzhQ9M8NvcHa57zUWsBLq8yV0qBjk",
  authDomain: "gen-lang-client-0803482873.firebaseapp.com",
  storageBucket: "gen-lang-client-0803482873.firebasestorage.app",
  messagingSenderId: "729143765180"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use custom databaseId from config
export const db = getFirestore(app, "ai-studio-instantwebhost-4a43b60a-e1af-4665-af2a-9282878e6855");
