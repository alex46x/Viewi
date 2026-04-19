
const { adminDb } = require('./src/lib/firebaseAdmin');

async function checkAnalytics() {
  try {
    const snapshot = await adminDb.collection('analytics').limit(5).get();
    console.log('Total analytics found (limit 5):', snapshot.size);
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

    const usersSnapshot = await adminDb.collection('users').limit(1).get();
    if (!usersSnapshot.empty) {
      const user = usersSnapshot.docs[0];
      const userId = user.id;
      console.log('Checking analytics for user:', userId);
      const userAnalytics = await adminDb.collection('analytics')
        .where('profileId', '==', userId)
        .get();
      console.log('Analytics for user:', userAnalytics.size);
    }
  } catch (error) {
    console.error('Error checking analytics:', error);
  }
}

checkAnalytics();
