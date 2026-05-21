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

    // Aggregations (Lifetime)
    const totalViews = analytics.length;
    const uniqueVisitors = new Set(analytics.map(a => a.ip)).size;

    // Get period query parameter
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7d';

    // Filter analytics for period breakdowns
    let filteredAnalytics = [...analytics];
    const now = new Date();
    
    if (period === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredAnalytics = analytics.filter(a => new Date(a.timestamp) >= sevenDaysAgo);
    } else if (period === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredAnalytics = analytics.filter(a => new Date(a.timestamp) >= thirtyDaysAgo);
    }
    // 'all' keeps full analytics array

    // Period specific totals
    const periodViews = filteredAnalytics.length;
    const periodUniqueVisitors = new Set(filteredAnalytics.map(a => a.ip)).size;

    // Daily visits calculation based on period
    const dailyVisits = [];
    const today = new Date();
    let daysToInclude = 7;
    
    if (period === '30d') {
      daysToInclude = 30;
    } else if (period === 'all') {
      if (analytics.length > 0 && analytics[analytics.length - 1].timestamp) {
        const oldestDate = new Date(analytics[analytics.length - 1].timestamp);
        const diffTime = Math.abs(today - oldestDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysToInclude = Math.min(Math.max(diffDays, 7), 90); // Cap between 7 and 90 days for clean chart
      } else {
        daysToInclude = 30;
      }
    }

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = analytics.filter(a => {
        const ts = a.timestamp;
        if (!ts) return false;
        
        try {
          const dateObj = typeof ts === 'string' ? new Date(ts) : ts.toDate();
          return dateObj.toISOString().split('T')[0] === dateStr;
        } catch (e) {
          return false;
        }
      }).length;
      
      dailyVisits.push({ date: dateStr, count });
    }

    // Devices breakdown (based on active period)
    const devices = filteredAnalytics.reduce((acc, curr) => {
      const type = curr.deviceType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Countries breakdown (based on active period)
    const countries = filteredAnalytics.reduce((acc, curr) => {
      const country = curr.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Browser breakdown (based on active period)
    const browsers = filteredAnalytics.reduce((acc, curr) => {
      const browser = curr.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    // Referrers breakdown (based on active period)
    const referrers = filteredAnalytics.reduce((acc, curr) => {
      let ref = curr.referrer || 'Direct';
      // Clean up URL to domain names for clean display
      if (ref.startsWith('http://') || ref.startsWith('https://')) {
        try {
          ref = new URL(ref).hostname;
        } catch (e) {}
      }
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});

    // Helper to mask IP addresses professionally
    const maskIP = (ip) => {
      if (!ip) return 'Anonymous';
      if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
      if (ip.includes(':')) {
        const parts = ip.split(':');
        return parts.slice(0, 3).join(':') + ':xxxx:xxxx';
      }
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xx.xx`;
      }
      return 'Anonymized';
    };

    // Masked recent visit logs (limit to latest 100 entries)
    const recentLogs = analytics.slice(0, 100).map(a => ({
      ip: maskIP(a.ip),
      country: a.country || 'Unknown',
      deviceType: a.deviceType || 'unknown',
      browser: a.browser || 'Unknown',
      referrer: (() => {
        let ref = a.referrer || 'Direct';
        if (ref.startsWith('http://') || ref.startsWith('https://')) {
          try {
            ref = new URL(ref).hostname;
          } catch (e) {}
        }
        return ref;
      })(),
      timestamp: a.timestamp
    }));

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      periodViews,
      periodUniqueVisitors,
      dailyVisits,
      devices: Object.entries(devices).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      countries: Object.entries(countries).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      browsers: Object.entries(browsers).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      referrers: Object.entries(referrers).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      recentLogs
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
