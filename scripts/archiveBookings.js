import admin from 'firebase-admin';

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function archiveBookings() {
  console.log("Starting archive old bookings job...");
  const bookingsRef = db.collection('bookings');
  
  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const snapshot = await bookingsRef.get();
  
  if (snapshot.empty) {
    console.log('No bookings found.');
    return;
  }

  let archiveCount = 0;
  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    const status = data.status;
    let updatedAt = Date.now();
    if (data.updated_at && data.updated_at.toDate) {
      updatedAt = data.updated_at.toDate().getTime();
    } else if (data.updated_at && data.updated_at._seconds) {
      updatedAt = data.updated_at._seconds * 1000;
    }
    
    let shouldArchive = false;

    if (status === 'completed') {
      if ((now - updatedAt) > 90 * MS_PER_DAY) shouldArchive = true;
    } else if (status === 'cancelled' || status === 'no-show') {
      if ((now - updatedAt) > 30 * MS_PER_DAY) shouldArchive = true;
    }

    if (shouldArchive) {
      console.log(`Archiving booking ${doc.id} (Status: ${status})`);
      const archiveRef = db.collection('bookings_archive').doc(doc.id);
      batch.set(archiveRef, data);
      batch.delete(doc.ref);
      archiveCount++;
    }
  });

  if (archiveCount > 0) {
    await batch.commit();
    console.log(`Successfully archived ${archiveCount} bookings.`);
  } else {
    console.log("No bookings needed archiving.");
  }
}

archiveBookings().catch(err => {
    console.error(err);
    process.exit(1);
});
