import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decoded.userId;

    // 1. Delete all analytics data associated with this user
    const analyticsSnapshot = await adminDb.collection('analytics')
      .where('profileId', '==', uid)
      .get();
    
    const batch = adminDb.batch();
    analyticsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // 2. Delete the user profile document
    await adminDb.collection('users').doc(uid).delete();

    // 3. Delete the user from Firebase Authentication
    await adminAuth.deleteUser(uid);

    // 4. Prepare response and clear session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Account and all data deleted successfully' 
    });

    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account. Please try again later.' 
    }, { status: 500 });
  }
}
