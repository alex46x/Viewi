import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Get all analytics for this profile from Firestore
    const snapshot = await adminDb.collection('analytics')
      .where('profileId', '==', decoded.userId)
      .orderBy('timestamp', 'desc')
      .get();

    const analytics = snapshot.docs.map(doc => doc.data());

    // Aggregations
    const totalViews = analytics.length;
    const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;

    // Daily visits (last 7 days)
    const dailyVisits = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = analytics.filter(a => {
        const ts = a.timestamp;
        // Firestore timestamps might be strings or Date objects depending on how they were saved
        const dateObj = typeof ts === 'string' ? new Date(ts) : ts.toDate();
        return dateObj.toISOString().split('T')[0] === dateStr;
      }).length;
      
      dailyVisits.push({ date: dateStr, count });
    }

    // Devices breakdown
    const devices = analytics.reduce((acc, curr) => {
      acc[curr.deviceType] = (acc[curr.deviceType] || 0) + 1;
      return acc;
    }, {});

    // Countries breakdown
    const countries = analytics.reduce((acc, curr) => {
      acc[curr.country] = (acc[curr.country] || 0) + 1;
      return acc;
    }, {});

    // Browser breakdown
    const browsers = analytics.reduce((acc, curr) => {
      acc[curr.browser] = (acc[curr.browser] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      dailyVisits,
      devices: Object.entries(devices).map(([name, value]) => ({ name, value })),
      countries: Object.entries(countries).map(([name, value]) => ({ name, value })),
      browsers: Object.entries(browsers).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
