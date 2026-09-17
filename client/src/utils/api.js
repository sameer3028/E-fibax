// Centralized API configuration and resilient request utility for Fibax Pharma

// Base URL detection:
// 1. Use VITE_API_URL environment variable if defined (e.g. in .env)
// 2. Otherwise default to relative path ''
let detectedBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Returns the currently active API base URL.
 */
export function getApiBase() {
  return detectedBaseUrl;
}

/**
 * Overrides the active API base URL at runtime if needed.
 */
export function setApiBase(url) {
  detectedBaseUrl = (url || '').replace(/\/$/, '');
}

/**
 * Resolves an API path (e.g. '/api/admin/login' or 'products') to a full URL.
 */
export function getApiUrl(endpoint, customBase = null) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = customBase !== null ? customBase : detectedBaseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullEndpoint = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
  return `${base}${fullEndpoint}`;
}

/**
 * Universal safe API fetch that handles HTML fallbacks, non-JSON responses,
 * network disconnects, and CORS errors with clean user-friendly messaging.
 * Automatically attempts a fallback to port 5000 if relative /api returns HTML (web server misconfiguration).
 */
export async function apiRequest(endpoint, options = {}) {
  const primaryUrl = getApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // Attempt 1: Using current base URL
  let result = await executeFetch(primaryUrl, options, headers);

  // If the server returned HTML (e.g. Apache/Nginx catch-all returning index.html for /api)
  // or connection failed and we're in a browser on a non-5000 port, attempt fallback to port 5000:
  if ((result.htmlError || result.networkError) && typeof window !== 'undefined' && !detectedBaseUrl) {
    const port = window.location.port;
    if (port !== '5000') {
      const fallbackBase = `${window.location.protocol}//${window.location.hostname}:5000`;
      const fallbackUrl = getApiUrl(endpoint, fallbackBase);
      console.warn(`[Fibax API] Primary endpoint returned HTML/offline (${primaryUrl}). Retrying on backend port 5000: ${fallbackUrl}`);

      try {
        const fallbackResult = await executeFetch(fallbackUrl, options, headers);
        if (fallbackResult.success || (!fallbackResult.htmlError && !fallbackResult.networkError)) {
          console.info(`[Fibax API] Successfully connected to backend at ${fallbackBase}! Persisting API base.`);
          detectedBaseUrl = fallbackBase;
          return fallbackResult;
        }
      } catch (e) {
        // Fallback also failed, will return original error
      }
    }
  }

  return result;
}

async function executeFetch(url, options, headers) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.error(`[API Network Error] ${url}:`, netErr);
    return {
      success: false,
      error: 'Unable to connect to server. Please check your internet connection or verify the backend server is running.',
      networkError: true
    };
  }

  const contentType = res.headers.get('content-type') || '';
  let text = '';
  try {
    text = await res.text();
  } catch (readErr) {
    return {
      success: false,
      status: res.status,
      error: 'Failed to read response from server.'
    };
  }

  // Check if response is HTML (web server returning index.html or 404 HTML page)
  const isHtml = contentType.includes('text/html') ||
    text.trim().startsWith('<!DOCTYPE') ||
    text.trim().startsWith('<html') ||
    text.trim().startsWith('<head');

  if (isHtml) {
    console.error(`[API Error] ${url} returned HTML instead of JSON:`, text.slice(0, 200));
    return {
      success: false,
      status: res.status,
      error: 'Backend API service is not reachable or not running on this server. The web server returned an HTML page instead of API JSON. Please make sure the Node.js backend server (port 5000) is running.',
      htmlError: true
    };
  }

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    console.error(`[API Parse Error] ${url}:`, text);
    return {
      success: false,
      status: res.status,
      error: 'Server returned an invalid response format.',
      rawText: text
    };
  }

  if (!res.ok || data.success === false) {
    return {
      success: false,
      status: res.status,
      error: data.error || data.message || `Request failed with status ${res.status}`,
      ...data
    };
  }

  return {
    success: true,
    status: res.status,
    ...data
  };
}
