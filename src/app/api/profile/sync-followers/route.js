import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

// Platforms that support REAL automated data fetching
const REAL_AUTO_SYNC_PLATFORMS = ['github', 'youtube'];

// Helper to extract username from URL
function getUsernameFromUrl(platform, url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname;
    // Remove leading and trailing slashes
    while (pathname.startsWith('/')) pathname = pathname.slice(1);
    while (pathname.endsWith('/')) pathname = pathname.slice(0, -1);

    if (platform === 'youtube') {
      if (pathname.startsWith('@')) return pathname.substring(1);
      if (pathname.startsWith('c/')) return pathname.substring(2);
      if (pathname.startsWith('user/')) return pathname.substring(5);
      if (pathname.startsWith('channel/')) return pathname.substring(8);
      return pathname;
    }

    if (platform === 'linkedin') {
      if (pathname.startsWith('in/')) return pathname.substring(3);
      return pathname;
    }

    if (platform === 'tiktok') {
      if (pathname.startsWith('@')) return pathname.substring(1);
      return pathname;
    }

    const segments = pathname.split('/');
    return segments[0] || '';
  } catch (e) {
    let cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const slashIdx = cleaned.indexOf('/');
    cleaned = slashIdx !== -1 ? cleaned.slice(slashIdx + 1) : '';
    while (cleaned.startsWith('/')) cleaned = cleaned.slice(1);
    while (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    if (cleaned.startsWith('@')) cleaned = cleaned.substring(1);
    return cleaned;
  }
}

// GitHub Follower fetcher — uses public API, no key needed
async function getGitHubFollowers(username) {
  if (!username) return null;
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'Viewi-Follower-Tracker/1.0' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status} for ${username}`);
      return null;
    }
    const data = await res.json();
    return typeof data.followers === 'number' ? data.followers : null;
  } catch (e) {
    console.error(`Error fetching GitHub followers for ${username}:`, e);
    return null;
  }
}

// Helper to parse "12.4K" or "1.2M" subscriber strings
function parseSubscriberText(text) {
  const numStr = text.replace(/[^0-9.KMBkmb]/g, '').trim().toUpperCase();
  if (!numStr) return null;

  let multiplier = 1;
  let valStr = numStr;
  if (numStr.endsWith('K')) { multiplier = 1000; valStr = numStr.slice(0, -1); }
  else if (numStr.endsWith('M')) { multiplier = 1000000; valStr = numStr.slice(0, -1); }
  else if (numStr.endsWith('B')) { multiplier = 1000000000; valStr = numStr.slice(0, -1); }

  const val = parseFloat(valStr);
  return isNaN(val) ? null : Math.round(val * multiplier);
}

// YouTube Subscriber Fetcher — HTML scraping
async function getYouTubeSubscribers(username) {
  if (!username) return null;
  try {
    let url = `https://www.youtube.com/@${username}`;
    if (username.startsWith('UC') || username.length > 20) {
      url = `https://www.youtube.com/channel/${username}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.warn(`YouTube fetch returned status ${res.status} for ${username}`);
      return null;
    }

    const html = await res.text();

    const patterns = [
      /"subscriberCountText"\s*:\s*\{\s*"accessibility"\s*:\s*\{\s*"accessibilityData"\s*:\s*\{\s*"label"\s*:\s*"([^"]+)"/,
      /"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/,
      /([0-9.]+[MKBmkb]?)\s+subscribers/i,
      /([0-9.]+[MKBmkb]?)\s+Subscriber/i,
    ];

    let subText = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) { subText = match[1]; break; }
    }

    if (!subText) {
      const metaMatch = html.match(/<meta\s+itemprop="subscriberCount"\s+content="([^"]+)"/i);
      if (metaMatch && metaMatch[1]) {
        const numVal = parseInt(metaMatch[1], 10);
        if (!isNaN(numVal)) return numVal;
      }

      const initialDataMatch = html.match(/var\s+ytInitialData\s*=\s*({.+?});/);
      if (initialDataMatch && initialDataMatch[1]) {
        try {
          const dataStr = initialDataMatch[1];
          const subIdx = dataStr.indexOf('subscriberCountText');
          if (subIdx !== -1) {
            const subPart = dataStr.substring(subIdx, subIdx + 300);
            const matchPart = subPart.match(/"simpleText"\s*:\s*"([^"]+)"/);
            if (matchPart && matchPart[1]) subText = matchPart[1];
          }
        } catch (e) { /* ignore */ }
      }
    }

    if (subText) {
      const cleaned = subText.replace(/subscribers|subscriber/i, '').trim();
      return parseSubscriberText(cleaned);
    }

    return null;
  } catch (e) {
    console.error(`Error fetching YouTube subscribers for ${username}:`, e);
    return null;
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await req.json();
    const { linkIndex } = body;

    if (linkIndex === undefined || typeof linkIndex !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid linkIndex' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(decoded.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const socialLinks = [...(userData.socialLinks || [])];

    if (linkIndex < 0 || linkIndex >= socialLinks.length) {
      return NextResponse.json({ error: 'Link index out of bounds' }, { status: 400 });
    }

    const targetLink = socialLinks[linkIndex];
    const { platform, url } = targetLink;

    // Only GitHub and YouTube support real auto-sync
    if (!REAL_AUTO_SYNC_PLATFORMS.includes(platform)) {
      return NextResponse.json({
        error: `Auto-sync is not available for ${platform}. Please enter your follower count manually.`,
        manualOnly: true
      }, { status: 422 });
    }

    if (!url) {
      return NextResponse.json({ error: 'Link URL is empty. Please add your profile URL first.' }, { status: 400 });
    }

    const username = getUsernameFromUrl(platform, url);
    if (!username) {
      return NextResponse.json({ error: 'Could not extract username from URL. Check the URL format.' }, { status: 400 });
    }

    let fetchedCount = null;

    if (platform === 'github') {
      fetchedCount = await getGitHubFollowers(username);
    } else if (platform === 'youtube') {
      fetchedCount = await getYouTubeSubscribers(username);
    }

    if (fetchedCount === null) {
      return NextResponse.json({
        error: `Could not fetch live data for ${platform}. The platform may be temporarily unavailable. Check your profile URL and try again.`,
        fetchFailed: true
      }, { status: 502 });
    }

    // Update link with real fetched data
    targetLink.followerCount = fetchedCount;
    targetLink.lastSyncedAt = new Date().toISOString();
    targetLink.isAutoSynced = true;

    socialLinks[linkIndex] = targetLink;
    await userRef.update({ socialLinks });

    return NextResponse.json({
      success: true,
      updatedLink: targetLink,
      fetchedCount
    });
  } catch (error) {
    console.error('Followers sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
