import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes asset URLs from the backend.
 * Handles:
 * 1. Absolute URLs pointing to localhost (re-bases them to the actual API URL)
 * 2. Relative paths (prefixes them with the API base URL)
 * 3. Already correct absolute URLs (returns as is)
 */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // If it's already a data URL or blob URL, return it
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '').replace(/\/$/, '');

  // Case 1: Absolute URL starting with http/https
  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      // In local dev, if the URL hostname doesn't match our API base URL hostname, 
      // it might be a production URL from the DB. We re-base it to our local API.
      const apiBaseHostname = new URL(apiBaseUrl).hostname;
      if (url.hostname !== apiBaseHostname && (apiBaseHostname === 'localhost' || apiBaseHostname === '127.0.0.1')) {
        return `${apiBaseUrl}${url.pathname}${url.search}`;
      }
      return path;
    } catch (e) {
      return path;
    }
  }

  // Case 2: Relative path
  // Ensure we don't double slash
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Strip 'public/' if it exists at the start (common Laravel issue)
  if (normalizedPath.startsWith('/public/')) {
    normalizedPath = normalizedPath.replace('/public/', '/');
  }
  
  // For Laravel, relative paths usually need to be prefixed with /storage
  // UNLESS they are in the web public folder
  const isLocalAsset = normalizedPath.startsWith('/images') || 
                      normalizedPath === '/logo.png' || 
                      normalizedPath === '/auth-bg.png' ||
                      normalizedPath === '/favicon.ico';

  if (!normalizedPath.startsWith('/storage') && !isLocalAsset) {
    normalizedPath = `/storage${normalizedPath}`;
  }
  
  // If it's a local web asset, don't use apiBaseUrl
  if (isLocalAsset) {
    return normalizedPath;
  }
  
  const finalUrl = `${apiBaseUrl}${normalizedPath}`;
  return finalUrl;
}
