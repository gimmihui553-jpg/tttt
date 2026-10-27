import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDe6A_ZNMuFT0xtK0EkkKFZc_V5IN_tspw",
  authDomain: "ai-studio-practice.firebaseapp.com",
  projectId: "ai-studio-practice",
  storageBucket: "ai-studio-practice.firebasestorage.app",
  messagingSenderId: "48117554136",
  appId: "1:48117554136:web:489643d6849ba2c9bab0ad",
  measurementId: "G-2WJJ181PC4"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface LeaderboardEntry {
  id?: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  score: number;
  lines: number;
  level: number;
  createdAt?: Timestamp | Date | any;
}

// Google Sign-In with popup, fallback to redirect if popup is blocked
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Popup sign-in failed or was blocked, attempting redirect...", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        throw redirectError;
      }
    }
    throw error;
  }
}

// Check redirect result on load
export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error("Redirect auth error:", err);
    return null;
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Submit a new high score
export async function submitScore(entry: Omit<LeaderboardEntry, 'createdAt' | 'id'>): Promise<string> {
  try {
    const scoresCol = collection(db, 'tetris_leaderboard');
    const docRef = await addDoc(scoresCol, {
      ...entry,
      score: Number(entry.score) || 0,
      lines: Number(entry.lines) || 0,
      level: Number(entry.level) || 1,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Error submitting score to Firestore:", error);
    throw error;
  }
}

// Subscribe to real-time top scores
export function subscribeToLeaderboard(
  count: number = 30,
  callback: (scores: LeaderboardEntry[], error?: string) => void
): () => void {
  try {
    const scoresCol = collection(db, 'tetris_leaderboard');
    const q = query(scoresCol, orderBy('score', 'desc'), limit(count));

    return onSnapshot(
      q,
      (snapshot) => {
        const scores: LeaderboardEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as LeaderboardEntry;
          scores.push({
            id: doc.id,
            ...data,
          });
        });
        callback(scores);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        callback([], error.message);
      }
    );
  } catch (err: any) {
    console.error("Failed to setup leaderboard subscription:", err);
    callback([], err.message);
    return () => {};
  }
}
