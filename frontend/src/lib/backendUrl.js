// Resolves the backend's URL automatically instead of relying on a
// hardcoded IP in .env.local. The trick: whatever host the browser used to
// load THIS page is necessarily a host that can reach your machine right
// now — localhost on the same machine, a LAN IP from your phone, or a real
// domain in production — so we just reuse it for the backend too (same
// machine, different port). No manual editing needed when your network or
// IP changes.
//
// NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL still work as explicit
// overrides — useful once frontend and backend are deployed to separate
// hosts and auto-detection no longer applies.

const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '5000';

function getBackendOrigin() {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;
  }
  // SSR/build-time fallback — window isn't available yet, but this only
  // matters for the very first server-rendered pass before hydration.
  return `http://localhost:${BACKEND_PORT}`;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || `${getBackendOrigin()}/api`;
}

export function getSocketUrl() {
  return process.env.NEXT_PUBLIC_SOCKET_URL || getBackendOrigin();
}

export function getGoogleOAuthUrl() {
  return `${getApiBaseUrl()}/auth/google`;
}
