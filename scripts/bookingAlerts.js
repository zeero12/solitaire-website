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

async function checkBookingAlerts() {
  console.log("Starting unactioned booking alert check...");
  const bookingsRef = db.collection('bookings');
  
  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // We check for bookings that are "new" and older than 24 hours
  const snapshot = await bookingsRef.where('status', '==', 'new').get();
  
  if (snapshot.empty) {
    console.log('No unactioned bookings found. All clear.');
    return;
  }

  let alertCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    
    let createdAt = Date.now();
    if (data.created_at && data.created_at.toDate) {
      createdAt = data.created_at.toDate().getTime();
    } else if (data.created_at && data.created_at._seconds) {
      createdAt = data.created_at._seconds * 1000;
    }

    if ((now - createdAt) > MS_PER_DAY) {
      alertCount++;
      const name = data.name || 'Unknown';
      const phone = data.phone || 'Unknown';
      const dateStr = data.preferred_date ? new Date(data.preferred_date).toLocaleDateString() : data.date;
      const timeStr = data.preferred_time || data.time;
      console.log(`[ALERT] Unactioned Booking: ${name} (${phone}) requested for ${dateStr} at ${timeStr}`);
    }
  });

  if (alertCount > 0) {
    console.log(`Found ${alertCount} unactioned bookings.`);
    // A non-zero exit code or writing to a Github Action output could trigger an email
    // but the prompt simply says "logs the client name... GitHub Actions will send an email on job completion".
  } else {
    console.log("No new bookings are older than 24 hours.");
  }
}

checkBookingAlerts().catch(err => {
    console.error(err);
    process.exit(1);
});
