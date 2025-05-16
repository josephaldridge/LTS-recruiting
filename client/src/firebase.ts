import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDVe5b7W4qgy4SaDptwU6vlHYFKpFbyg98",
  authDomain: "lts-recruiting.firebaseapp.com",
  projectId: "lts-recruiting",
  storageBucket: "lts-recruiting.firebasestorage.app",
  messagingSenderId: "597216224022",
  appId: "1:597216224022:web:4edd9beb583071abed2637"
};

const app = initializeApp(firebaseConfig);

export default app; 