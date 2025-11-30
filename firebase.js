const firebaseConfig = {
  apiKey: "AIzaSyA0nV1kSuJFiMDM9WV2vDAqGiXp6jPcsm4",
  authDomain: "hogboxing-35911.firebaseapp.com",
  projectId: "hogboxing-35911",
  storageBucket: "hogboxing-35911.firebasestorage.app",
  messagingSenderId: "911173936135",
  appId: "1:911173936135:web:a34c9c81ab4ce23645f6a2",
  measurementId: "G-FJPPNS2QQN"
};
// 2) Firebase 초기화 (v8 호환 방식 — 현재 script.js에서 firebase.auth(), firebase.database() 사용 중)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 전역에서 쓰는 편의 레퍼런스
const auth = firebase.auth();
const db = firebase.database();
