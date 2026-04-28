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
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
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
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.GET, 'bookings');
    }
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
  }, (error: any) => {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
    }
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
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.UPDATE, 'bookings');
    }
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
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.CREATE, 'whatsapp_leads');
    }
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

// ─── Blog Functions ───────────────────────────────────────────

export const fetchBlogs = async () => {
  if (isDemo || !db) return [];
  try {
    const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.GET, 'blogs');
    }
    console.error("Firebase fetchBlogs error:", error);
    return [];
  }
};

export const addBlog = async (blogData: any) => {
  if (isDemo || !db) return { success: false, error: 'Firebase is not configured.' };
  try {
    const docRef = await addDoc(collection(db, 'blogs'), {
      ...blogData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.CREATE, 'blogs');
    }
    console.error("Firebase addBlog error:", error);
    return { success: false, error: error.message };
  }
};

export const updateBlog = async (blogId: string, blogData: any) => {
  if (isDemo || !db) return { success: false, error: 'Firebase is not configured.' };
  try {
    await updateDoc(doc(db, 'blogs', blogId), {
      ...blogData,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.UPDATE, 'blogs');
    }
    console.error("Firebase updateBlog error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteBlog = async (blogId: string) => {
  if (isDemo || !db) return { success: false, error: 'Firebase is not configured.' };
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
    return { success: true };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.DELETE, 'blogs');
    }
    console.error("Firebase deleteBlog error:", error);
    return { success: false, error: error.message };
  }
};

