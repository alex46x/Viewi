import { adminAuth } from './firebaseAdmin';

export async function verifyToken(token) {
  if (!token) return null;
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      username: decodedToken.name || decodedToken.email.split('@')[0],
      email: decodedToken.email
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// hashPassword and comparePassword are no longer needed as Firebase handles this
export async function hashPassword(password) { return password; }
export async function comparePassword(password, hashed) { return true; }
export function signToken(payload) { return ''; }
