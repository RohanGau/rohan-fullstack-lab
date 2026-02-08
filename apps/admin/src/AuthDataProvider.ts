export const ADMIN_TOKEN_KEY = 'admin_token'; // legacy fallback
export const ACCESS_TOKEN_KEY = 'admin_access_token';
export const REFRESH_TOKEN_KEY = 'admin_refresh_token';

function getApiUrl(): string {
  return process.env.REACT_APP_API_URL || 'https://rohan-backend-api-stage.fly.dev';
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearStoredAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function storeJwtTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function refreshAccessToken(apiUrl = getApiUrl()): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearStoredAuth();
      return null;
    }

    const payload = await response.json();
    if (!payload?.accessToken || !payload?.refreshToken) {
      clearStoredAuth();
      return null;
    }

    storeJwtTokens(payload.accessToken, payload.refreshToken);
    return payload.accessToken;
  } catch {
    clearStoredAuth();
    return null;
  }
}

const authProvider = {
  login: async ({ token }: { token: string }) => {
    if (!token) return Promise.reject('No token provided');

    const apiUrl = getApiUrl();

    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.accessToken && payload?.refreshToken) {
          storeJwtTokens(payload.accessToken, payload.refreshToken);
          return Promise.resolve();
        }
      }
    } catch {
      // Fall through to legacy token mode
    }

    // Backward compatibility path while older API versions are still in use
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return Promise.resolve();
  },
  logout: () => {
    clearStoredAuth();
    return Promise.resolve();
  },
  checkError: (error: any) => {
    const status = error.status || error.response?.status;
    if (status === 401) {
      clearStoredAuth();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    return getStoredAccessToken() ? Promise.resolve() : Promise.reject();
  },
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
