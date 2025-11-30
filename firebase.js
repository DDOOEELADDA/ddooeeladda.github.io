// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0nV1kSuJFiMDM9WV2vDAqGiXp6jPcsm4",
  authDomain: "hogboxing-35911.firebaseapp.com",
  projectId: "hogboxing-35911",
  storageBucket: "hogboxing-35911.firebasestorage.app",
  messagingSenderId: "911173936135",
  appId: "1:911173936135:web:a34c9c81ab4ce23645f6a2",
  measurementId: "G-FJPPNS2QQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
