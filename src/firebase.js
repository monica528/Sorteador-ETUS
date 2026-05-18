import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCZN7q9N4OHKoz4PzkJO75YAlQmxJjHNEw",
  authDomain: "sorteador-etus.firebaseapp.com",
  projectId: "sorteador-etus",
  storageBucket: "sorteador-etus.firebasestorage.app",
  messagingSenderId: "312597522110",
  appId: "1:312597522110:web:ff17224f05c72b44d3e0ef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
