// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  getDoc,
  deleteDoc,
  query,
  getDocs,
  where,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxQ_zXbkOhONW-pHier-tNAW4d2af-qzc",
  authDomain: "studeats-4d540.firebaseapp.com",
  projectId: "studeats-4d540",
  storageBucket: "studeats-4d540.appspot.com",
  messagingSenderId: "809246651474",
  appId: "1:809246651474:web:6b2306d205fa1f6d2f9b8b",
  measurementId: "G-8R1F4VNE9S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  getAuth,
  signOut,
  app,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  onAuthStateChanged,
  onSnapshot,
  query,
  getDocs,
  where,
};
