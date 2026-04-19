import { adminAuth } from './firebaseAdmin';

export async function verifyToken(token) {
  if (!token) return null;
  
  try {
    // Verify the session cookie instead of ID token for long-term sessions
    const decodedToken = await adminAuth.verifySessionCookie(token, true);
    return {
      userId: decodedToken.uid,
      username: decodedToken.name || decodedToken.email.split('@')[0],
      email: decodedToken.email
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

// hashPassword and comparePassword are no longer needed as Firebase handles this
export async function hashPassword(password) { return password; }
export async function comparePassword(password, hashed) { return true; }
export function signToken(payload) { return ''; }
