import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCA_nAtmaN9Bs7a5q-c9za5eSMnk0Ys5Xs",
  authDomain: "fuad-editing-zone.firebaseapp.com",
  projectId: "fuad-editing-zone",
  storageBucket: "fuad-editing-zone.firebasestorage.app",
  messagingSenderId: "832389657221",
  appId: "1:832389657221:web:8a85d5dda0803770376fec",
  measurementId: "G-ZCKW4GPDLT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
