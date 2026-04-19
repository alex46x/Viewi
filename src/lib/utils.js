import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const PLATFORM_BASE_URLS = {
  facebook: 'https://facebook.com/',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  telegram: 'https://t.me/',
  youtube: 'https://youtube.com/@', // YouTube usually uses @username now
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/in/',
  tiktok: 'https://tiktok.com/@',
  discord: 'https://discord.gg/',
};

export function normalizeSocialLink(platform, input) {
  if (!input) return '';
  
  const trimmed = input.trim();
  const baseUrl = PLATFORM_BASE_URLS[platform];
  
  if (!baseUrl) return trimmed; // For 'website' or unknown platforms, return as is

  // If it already looks like a URL (starts with http), return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's a platform URL, we could potentially clean it, but usually standard URLs are fine.
    return trimmed;
  }

  // Handle '@' prefix if user included it for platforms that don't need it or vice versa
  let username = trimmed;
  if (username.startsWith('@')) {
    username = username.substring(1);
  }

  // Prepend base URL
  return `${baseUrl}${username}`;
}
