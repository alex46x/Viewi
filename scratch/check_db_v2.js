
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Mock a minimal environment to use firebaseAdmin.js logic or just re-implement here
function init() {
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.error('serviceAccountKey.json not found');
    process.exit(1);
  }
}

async function check() {
  init();
  const db = admin.firestore();
  
  console.log('--- Collection: analytics ---');
  const analyticsAll = await db.collection('analytics').get();
  console.log('Total documents in analytics:', analyticsAll.size);
  
  if (analyticsAll.size > 0) {
    analyticsAll.limit(3).docs.forEach(doc => {
      console.log('ID:', doc.id, 'Data:', doc.data());
    });
  }

  console.log('--- Collection: users ---');
  const usersAll = await db.collection('users').get();
  console.log('Total users:', usersAll.size);
  usersAll.docs.forEach(doc => {
    console.log('User ID:', doc.id, 'Username:', doc.data().username);
  });
}

check().catch(console.error);
