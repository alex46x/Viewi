import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Check if we have environment variables (Vercel / Production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } 
    // Only attempt to load serviceAccountKey.json in development environment
    else if (process.env.NODE_ENV === 'development') {
      try {
        const serviceAccount = require('../../serviceAccountKey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (e) {
        console.warn('Firebase Admin: serviceAccountKey.json not found in development.');
      }
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
