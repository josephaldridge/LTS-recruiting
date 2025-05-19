import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration for LTS Recruiting
const firebaseConfig = {
  apiKey: "AIzaSyDVe5b7W4qgy4SaDptwU6vlHYFKpFbyg98",
  authDomain: "lts-recruiting.firebaseapp.com",
  projectId: "lts-recruiting",
  storageBucket: "lts-recruiting.firebasestorage.app",
  messagingSenderId: "597216224022",
  appId: "1:597216224022:web:4edd9beb583071abed2637"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 