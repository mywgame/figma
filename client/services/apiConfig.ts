/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dynamically resolves the API Base URL based on environment:
 * - On Web (browser): uses relative path `/api/v1` to prevent CORS issues and preserve same-origin requests.
 * - On Capacitor Native (Android/iOS APK): uses the production absolute URL `https://metafirm.app/api/v1` (or VITE_API_BASE_URL)
 *   so fetch calls reach the remote Railway backend instead of failing inside the local WebView.
 */
export const getApiBaseUrl = (): string => {
  // 1. Explicit build/runtime environment variable override
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    const cleanBase = envBaseUrl.replace(/\/$/, '');
    return cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;
  }

  // 2. Detect if executing inside a Capacitor Android or iOS native app container
  const isCapacitorNative =
    typeof window !== 'undefined' &&
    ((window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && !window.location.port));

  if (isCapacitorNative) {
    return 'https://api.metafirm.app/api/v1';
  }

  // 3. Web app default when hosted on Vercel frontend (metafirm.app or *.vercel.app)
  if (typeof window !== 'undefined' && (window.location.hostname.includes('metafirm.app') || window.location.hostname.endsWith('.vercel.app'))) {
    return 'https://api.metafirm.app/api/v1';
  }

  // 4. Web app default for same-origin dev proxy
  return '/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Utility to format endpoint URLs correctly regardless of leading slashes or full path prefix.
 * Example:
 * getApiUrl('/auth/login') -> '/api/v1/auth/login' (Web) or 'https://metafirm.app/api/v1/auth/login' (Capacitor)
 * getApiUrl('/api/v1/auth/login') -> '/api/v1/auth/login' (Web) or 'https://metafirm.app/api/v1/auth/login' (Capacitor)
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/v1')) {
    const subPath = cleanEndpoint.slice(7);
    return `${API_BASE_URL}${subPath.startsWith('/') ? subPath : `/${subPath}`}`;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};
