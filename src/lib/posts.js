import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const postsCol = collection(db, "posts");

export async function createPost({ text, author, location }) {
  const cleaned = (text ?? "").trim();
  if (!cleaned) throw new Error("Post text is required.");

  const base = {
    text: cleaned,
    authorUid: author?.uid ?? null,
    authorName: author?.displayName ?? author?.email ?? "Anonymous",
    createdAt: serverTimestamp(),
  };

  const lat = location?.lat;
  const lng = location?.lng;
  if (typeof lat === "number" && typeof lng === "number") {
    base.location = { lat, lng };
  }

  await addDoc(postsCol, base);
}

export async function listLatestPosts({ max = 50 } = {}) {
  const q = query(postsCol, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

