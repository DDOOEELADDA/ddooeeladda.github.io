// server.js
// 공식 매치메이킹 서버 (Node.js + Firebase Admin)

const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

/* =========================
   Firebase Admin 초기화
========================= */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://hogboxing-35911-default-rtdb.firebaseio.com"
});

const db = admin.database();

/* =========================
   Express 설정
========================= */
const app = express();
app.use(bodyParser.json());

/* =========================
   티어 계산 함수
========================= */
function getTier(rating) {
  if (rating < 800) return "Bronze";
  if (rating < 1000) return "Silver";
  if (rating < 1200) return "Gold";
  if (rating < 1400) return "Platinum";
  if (rating < 1600) return "Diamond";
  if (rating < 1800) return "Master";
  if (rating < 2000) return "Grandmaster";
  return "Champion";
}

/* =========================
   매치메이킹 요청
   POST /matchmaking/join
========================= */
app.post("/matchmaking/join", async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "uid required" });

  try {
    const userSnap = await db.ref(`users/${uid}`).once("value");
    if (!userSnap.exists()) return res.status(404).json({ error: "user not found" });

    const user = userSnap.val();
    const rating = user.rating ?? 1000;
    const tier = getTier(rating);

    // 큐 등록
    await db.ref(`matchmakingQueue/${uid}`).set({
      uid,
      battleTag: user.battleTag,
      rating,
      tier,
      queuedAt: Date.now()
    });

    res.json({ success: true, tier, rating });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

/* =========================
   매치메이킹 처리 루프
========================= */
async function matchmakingLoop() {
  const snap = await db.ref("matchmakingQueue").once("value");
  if (!snap.exists()) return;

  const queue = Object.values(snap.val());
  queue.sort((a, b) => a.queuedAt - b.queuedAt);

  const used = new Set();

  for (let i = 0; i < queue.length; i++) {
    if (used.has(queue[i].uid)) continue;

    for (let j = i + 1; j < queue.length; j++) {
      if (used.has(queue[j].uid)) continue;

      const diff = Math.abs(queue[i].rating - queue[j].rating);
      if (diff <= 150) {
        await createMatch(queue[i], queue[j]);
        used.add(queue[i].uid);
        used.add(queue[j].uid);
        break;
      }
    }
  }
}

/* =========================
   공식 매치 생성
========================= */
async function createMatch(a, b) {
  const matchRef = db.ref("matches").push();

  const matchData = {
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    players: {
      [a.uid]: { battleTag: a.battleTag, rating: a.rating },
      [b.uid]: { battleTag: b.battleTag, rating: b.rating }
    },
    status: "ACTIVE"
  };

  await matchRef.set(matchData);

  // 큐 제거
  await db.ref(`matchmakingQueue/${a.uid}`).remove();
  await db.ref(`matchmakingQueue/${b.uid}`).remove();

  console.log("MATCH CREATED", matchRef.key);
}

/* =========================
   주기 실행
========================= */
setInterval(matchmakingLoop, 3000);

/* =========================
   서버 실행
========================= */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Matchmaking server running on ${PORT}`);
});
