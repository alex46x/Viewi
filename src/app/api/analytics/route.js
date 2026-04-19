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
    // Removed .orderBy('timestamp', 'desc') to avoid composite index requirement
    console.log(`[Analytics API] Fetching data for userId: ${decoded.userId}`);
    
    let snapshot;
    try {
      snapshot = await adminDb.collection('analytics')
        .where('profileId', '==', decoded.userId)
        .get();
    } catch (dbError) {
      console.error('[Analytics API] Database query failed:', dbError);
      throw dbError;
    }

    console.log(`[Analytics API] Found ${snapshot.size} records`);

    // Map and sort in memory
    const analytics = snapshot.docs.map(doc => doc.data())
      .sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });

    // Aggregations
    const totalViews = analytics.length;
    const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;

    // Daily visits (last 7 days)
    const dailyVisits = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = analytics.filter(a => {
        const ts = a.timestamp;
        if (!ts) return false;
        
        // Firestore timestamps might be strings or Date objects depending on how they were saved
        try {
          const dateObj = typeof ts === 'string' ? new Date(ts) : ts.toDate();
          return dateObj.toISOString().split('T')[0] === dateStr;
        } catch (e) {
          return false;
        }
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
