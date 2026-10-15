export interface AuthUser {
  id: string;
  name: string;
}

/** Client/org payload from EdDSA login response */
export interface AuthClient {
  id: string;
  /** Company / client abbreviation (also exposed as cli_abbr by some login payloads) */
  abbr: string;
  adm_uid: string;
  group_name: string;
  slogan: string;
  enabled: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  client?: AuthClient | null;
}

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';
const CLIENT_KEY = 'auth_client';
/** Legacy localStorage key; migrate / clear alongside cookie. */
const LEGACY_ACCESS_TOKEN_KEY = 'auth_token';

function getCookie(name: string): string | null {
  const encoded = encodeURIComponent(name);
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${encoded}=`) || trimmed.startsWith(`${name}=`)) {
      const value = trimmed.slice(trimmed.indexOf('=') + 1);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7): void {
  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAgeSeconds}`,
    'SameSite=Lax',
  ].join('; ');
}

function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessTokenFromCookie(): string | null {
  const value = getCookie(ACCESS_TOKEN_COOKIE);
  return value && value.trim() ? value : null;
}

export function saveSession(session: AuthSession): void {
  setCookie(ACCESS_TOKEN_COOKIE, session.accessToken);
  if (session.user?.id) {
    setCookie('user_id', session.user.id);
  }
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  if (session.client) {
    localStorage.setItem(CLIENT_KEY, JSON.stringify(session.client));
  } else {
    localStorage.removeItem(CLIENT_KEY);
  }
  const abbr = session.client?.abbr?.trim();
  if (abbr) {
    localStorage.setItem('cli_abbr', abbr);
  }
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function clearSession(): void {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie('user_id');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CLIENT_KEY);
  localStorage.removeItem('cli_abbr');
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return getAccessTokenFromCookie();
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthClient(): AuthClient | null {
  const raw = localStorage.getItem(CLIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthClient;
  } catch {
    return null;
  }
}

/** cli_abbr from login client (client.abbr / client.cli_abbr) or persisted key */
export function getSessionCliAbbr(): string {
  const client = getAuthClient() as (AuthClient & { cli_abbr?: string }) | null;
  const fromClient = (client?.abbr || client?.cli_abbr || '').trim();
  if (fromClient) return fromClient;
  return (localStorage.getItem('cli_abbr') || '').trim();
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessTokenFromCookie());
}

const AUTH_PUBLIC_PATH_RE = /\/api\/EdDSA-island\/(login|register)(?:\?|$)/i;

export function isAuthPublicRequest(url?: string): boolean {
  if (!url) return false;
  return AUTH_PUBLIC_PATH_RE.test(url);
}

/** After any backend call: if Cookie has no access_token, go to login. */
export function ensureAccessTokenOrRedirect(requestUrl?: string): boolean {
  if (isAuthPublicRequest(requestUrl)) {
    return true;
  }
  if (getAccessTokenFromCookie()) {
    return true;
  }
  clearSession();
  redirectToLogin();
  return false;
}

export function redirectToLogin(): void {
  if (window.location.search.includes('auth=login')) {
    return;
  }
  window.location.assign('/?auth=login');
}
