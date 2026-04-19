import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req) {
  try {
    const { idToken, username } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check/Sync User in Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If no username provided, tell frontend this is a new user
      if (!username) {
        return NextResponse.json({ 
          newUser: true, 
          email,
          message: 'Please choose a username' 
        });
      }

      // Check if username is already taken by someone else
      const usernameCheck = await adminDb.collection('users')
        .where('username', '==', username.toLowerCase())
        .limit(1)
        .get();

      if (!usernameCheck.empty) {
        return NextResponse.json({ error: 'Username already taken. Please try another.' }, { status: 400 });
      }

      // Create profile for new user
      await userRef.set({
        email,
        username: username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        name: name || '',
        image: picture || '',
        bio: '',
        socialLinks: [],
        isPublic: true,
        showDob: false,
        dob: null,
        createdAt: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({ success: true, uid });

    // Create a Session Cookie instead of using the raw ID token
    // This allows sessions to last up to 14 days (we'll use 7 days)
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set HTTP-only cookie
    response.cookies.set('token', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
  }
}
