import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// ─── App Initialization ───────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB_jCps5CpO0t7yt6pYHrdgBmjcNXwDr_Q",
  authDomain: "solitaire-financial.firebaseapp.com",
  projectId: "solitaire-financial",
  storageBucket: "solitaire-financial.firebasestorage.app",
  messagingSenderId: "908254636324",
  appId: "1:908254636324:web:a197a33824951694ed6bb1"
};

// Initialize Firebase with provided config or fallbacks
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const isDemo = firebaseConfig.apiKey === "demo-api-key";

// ─── Booking Functions ────────────────────────────────────────

// Write: Submit a new booking request
export const submitBooking = async (bookingData: any) => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!db) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      status: 'new',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Firebase submitBooking error:", error);
    return { success: false, error: error.message };
  }
};

// Read: Fetch all bookings once (initial load)
export const fetchBookings = async () => {
  if (isDemo || !db) return [];
  try {
    const q = query(
      collection(db, 'bookings'),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Firebase fetchBookings error:", error);
    return [];
  }
};

// Read: Real-time listener — fires on every new/updated booking
export const subscribeToBookings = (callback: (bookings: any[]) => void) => {
  if (isDemo || !db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'bookings'),
    orderBy('created_at', 'desc')
  );
  // Returns unsubscribe function — call on component unmount
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  }, (error) => {
    console.error("Firebase subscribeToBookings error:", error);
  });
};

// Update: Change booking status from admin dashboard
export const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!db) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: newStatus,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    console.error("Firebase updateBookingStatus error:", error);
    return { success: false, error: error.message };
  }
};

// ─── Lead Capture Functions ───────────────────────────────────

export const submitWhatsappLead = async (phone: string, sourcePage: string) => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!db) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    await addDoc(collection(db, 'whatsapp_leads'), {
      phone,
      optin: true,
      source_page: sourcePage,
      created_at: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    console.error("Firebase submitWhatsappLead error:", error);
    return { success: false, error: error.message };
  }
};

// ─── Auth Functions ───────────────────────────────────────────

export const adminLogin = async (email: string, password: string) => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!auth) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Firebase adminLogin error:", error);
    return { success: false, error: error.message };
  }
};

export const adminLogout = async () => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!auth) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Firebase adminLogout error:", error);
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  if (isDemo || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
