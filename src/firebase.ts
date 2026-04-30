import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
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
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const auth = getAuth(app);

const isDemo = firebaseConfig.apiKey === "demo-api-key";

import { getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  if (isDemo || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// ─── Booking Functions ────────────────────────────────────────

// Write: Submit a new booking request
export const submitBooking = async (bookingData: any) => {
  if (isDemo) return { success: false, error: 'Firebase is not configured. Please add your API key to the environment variables.' };
  if (!db) return { success: false, error: 'Firebase not configured. Please check environment variables.' };
  try {
    if (bookingData.phone && bookingData.date) {
      const q = query(
        collection(db, 'bookings'),
        where('phone', '==', bookingData.phone),
        where('date', '==', bookingData.date)
      );
      const snapshot = await getDocs(q);
      const hasDuplicate = snapshot.docs.some(doc => {
        const data = doc.data();
        return data.status === 'new' || data.status === 'confirmed';
      });

      if (hasDuplicate) {
        return {
          success: false,
          error: 'duplicate',
          message: 'A booking already exists for this number on the selected date.'
        };
      }
    }

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

export const confirmBooking = async (bookingId: string) => updateBookingStatus(bookingId, 'confirmed');
export const completeBooking = async (bookingId: string) => updateBookingStatus(bookingId, 'completed');
export const markNoShow = async (bookingId: string) => updateBookingStatus(bookingId, 'no-show');
export const cancelBooking = async (bookingId: string) => updateBookingStatus(bookingId, 'cancelled');

export const rescheduleBooking = async (bookingId: string, newDate: string, newTime: string) => {
  if (isDemo || !db) return { success: false };
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'rescheduled',
      date: newDate,
      time: newTime,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.UPDATE, 'bookings');
    }
    console.error("Firebase rescheduleBooking error:", error);
    return { success: false, error: error.message };
  }
};

export const archiveBooking = async (bookingId: string) => {
  if (isDemo || !db) return { success: false };
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (bookingSnap.exists()) {
      const data = bookingSnap.data();
      // add try/catch around adding to archive? Actually it throws on error
      await setDoc(doc(db, 'bookings_archive', bookingId), data);
      await deleteDoc(bookingRef);
      return { success: true };
    }
    return { success: false, error: 'Not found' };
  } catch (error: any) {
    console.error("Firebase archiveBooking error:", error);
    return { success: false, error: error.message };
  }
};

// ─── Availability Functions ───────────────────────────────────

// Read availability settings
export const getAvailabilitySettings = async () => {
  if (isDemo || !db) {
    return {
      success: true,
      data: {
        blockedDates: [],
        workingHours: { start: "10:00", end: "18:00" },
        blockedWeekdays: [0]
      }
    };
  }
  try {
    const docRef = doc(db, 'availability', 'settings');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.data() };
    }
    return {
      success: true,
      data: {
        blockedDates: [],
        workingHours: { start: "10:00", end: "18:00" },
        blockedWeekdays: [0]
      }
    };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.GET, 'availability/settings');
    }
    return { success: false, error: error.message };
  }
};

// Save availability settings (admin only)
export const saveAvailabilitySettings = async (settings: any) => {
  if (isDemo || !db) return { success: false };
  try {
    const docRef = doc(db, 'availability', 'settings');
    await setDoc(docRef, settings);
    return { success: true };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(error, OperationType.WRITE, 'availability/settings');
    }
    return { success: false, error: error.message };
  }
};

// Add a single blocked date
export const addBlockedDate = async (date: string, reason: string) => {
  if (isDemo || !db) return { success: false };
  try {
    const result = await getAvailabilitySettings();
    if (!result.success || !result.data) return { success: false, error: result.error };
    const current = result.data as any;
    const alreadyBlocked = current.blockedDates.some((d: any) => d.date === date);
    if (alreadyBlocked) return { success: false, error: 'Date already blocked' };
    current.blockedDates.push({ date, reason: reason || '' });
    return await saveAvailabilitySettings(current);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Remove a single blocked date
export const removeBlockedDate = async (date: string) => {
  if (isDemo || !db) return { success: false };
  try {
    const result = await getAvailabilitySettings();
    if (!result.success || !result.data) return { success: false, error: result.error };
    const current = result.data as any;
    current.blockedDates = current.blockedDates.filter((d: any) => d.date !== date);
    return await saveAvailabilitySettings(current);
  } catch (error: any) {
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
    
    function decodeHtmlEntities(str: any) {
      if (typeof str !== 'string') return str;
      if (!str.includes('&')) return str;
      const doc = new DOMParser().parseFromString(str, 'text/html');
      return doc.documentElement.textContent || str;
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.title) data.title = decodeHtmlEntities(data.title);
      if (data.excerpt) data.excerpt = decodeHtmlEntities(data.excerpt);
      if (data.content) data.content = decodeHtmlEntities(data.content);
      return { id: doc.id, ...data };
    });
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

