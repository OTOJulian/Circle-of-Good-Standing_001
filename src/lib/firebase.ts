import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACHPxhsEjlS75Hg8zKw7-HvmGB-7uLDPg",
  authDomain: "circle-of-good-standing.firebaseapp.com",
  projectId: "circle-of-good-standing",
  storageBucket: "circle-of-good-standing.firebasestorage.app",
  messagingSenderId: "859510802766",
  appId: "1:859510802766:web:1809ce743dc8f744d0361f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
