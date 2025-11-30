const firebaseConfig = {
  apiKey: "AIzaSyA0nV1kSuJFiMDM9WV2vDAqGiXp6jPcsm4",
  authDomain: "hogboxing-35911.firebaseapp.com",
  databaseURL: "https://hogboxing-35911-default-rtdb.asia-southeast1.firebasedatabase.app",  // 🔥 추가됨
  projectId: "hogboxing-35911",
  storageBucket: "hogboxing-35911.firebasestorage.app",
  messagingSenderId: "911173936135",
  appId: "1:911173936135:web:a34c9c81ab4ce23645f6a2",
  measurementId: "G-FJPPNS2QQN"
};

// Firebase 초기화 (v8 방식)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 전역 사용
const auth = firebase.auth();
const db = firebase.database();
