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

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');

  // Case 1: Absolute URL starting with http/https
  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      // If the URL points to localhost but our API isn't on localhost (or even if it is, we prefer the config base)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return `${apiBaseUrl}${url.pathname}${url.search}`;
      }
      return path;
    } catch (e) {
      return path;
    }
  }

  // Case 2: Relative path
  // Ensure we don't double slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
