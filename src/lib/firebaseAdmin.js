import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } 
    else if (process.env.NODE_ENV === 'development') {
      try {
        const jsonPath = path.join(process.cwd(), 'serviceAccountKey.json');
        if (fs.existsSync(jsonPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        }
      } catch (e) {
        console.warn('Firebase Admin: serviceAccountKey.json not found in development.');
      }
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

// Only export services if app is initialized
const adminDb = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminDb, adminAuth };
