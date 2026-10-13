import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fourseasonsdrivingschool-7541c.firebaseapp.com",
  projectId: "fourseasonsdrivingschool-7541c",
  storageBucket: "fourseasonsdrivingschool-7541c.firebasestorage.app",
  messagingSenderId: "796006457722",
  appId: "1:796006457722:web:3942ddaf562446a0bcf6c3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function googleLogin() {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    user,
    idToken,
  };
}
