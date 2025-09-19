/**
 * API utility functions for consistent URL handling
 */

// Helper to normalize URLs (removes trailing slash)
function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '');
}

// Get the backend URL for server-side API calls (BFF pattern)
export function getApiUrl(path: string): string {
  // For server actions, use the Next.js API routes (BFF pattern)
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeUrl(baseUrl)}/api${normalizedPath}`;
}

// Get the backend URL for direct backend calls (for Next.js API routes)
export function getBackendUrl(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeUrl(backendUrl)}/api${normalizedPath}`;
}

// For client-side API calls (should use Next.js API routes)
export function getClientApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/api${normalizedPath}`;
}
