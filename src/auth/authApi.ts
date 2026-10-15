import axios from 'axios';
import { AuthClient, AuthSession, AuthUser, saveSession } from './session';
import { fingerprintOfPassword } from './passwordFingerprint';
import { brandingConfig } from '../config/branding';

const AUTH_BASE =
  import.meta.env.VITE_AUTH_BASE_URL || '/api/EdDSA-island';

export interface AuthFormInput {
  username: string;
  email_addr: string;
  password: string;
}

interface AuthRequestBody {
  username: string;
  email_addr: string;
  fingerprint_of_password: string;
}

interface AuthApiResponse {
  access_token?: string;
  refresh_token?: string;
  token?: string;
  user?: AuthUser;
  client?: AuthClient & { cli_abbr?: string };
  /** Some login payloads expose cli_abbr at the top level */
  cli_abbr?: string;
}

function normalizeClient(
  raw: (AuthClient & { cli_abbr?: string }) | undefined,
  topLevelCliAbbr?: string
): AuthClient | null {
  if (!raw || typeof raw !== 'object') {
    const abbr = (topLevelCliAbbr || '').trim();
    if (!abbr) return null;
    return {
      id: '',
      abbr,
      adm_uid: '',
      group_name: '',
      slogan: '',
      enabled: '',
    };
  }
  return {
    id: String(raw.id ?? ''),
    abbr: String(raw.abbr || raw.cli_abbr || topLevelCliAbbr || '').trim(),
    adm_uid: String(raw.adm_uid ?? ''),
    group_name: String(raw.group_name ?? ''),
    slogan: String(raw.slogan ?? ''),
    enabled: String(raw.enabled ?? ''),
  };
}

function toSession(data: AuthApiResponse): AuthSession {
  const accessToken = data.access_token || data.token;
  if (!accessToken) {
    throw new Error('登录响应缺少 access_token');
  }
  return {
    accessToken,
    refreshToken: data.refresh_token || accessToken,
    user: data.user || { id: '', name: '' },
    client: normalizeClient(data.client, data.cli_abbr),
  };
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const msg =
        (data as { message?: string; error?: string; reason?: string }).message ||
        (data as { message?: string; error?: string; reason?: string }).error ||
        (data as { message?: string; error?: string; reason?: string }).reason;
      if (msg) return msg;
    }
    if (error.response?.status === 409) return '用户名已注册';
    if (error.response?.status === 401) return '用户名或密码错误';
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return '请求失败，请稍后重试';
}

function toAuthBody(input: AuthFormInput): AuthRequestBody {
  return {
    username: input.username,
    email_addr: input.email_addr,
    fingerprint_of_password: fingerprintOfPassword(input.password),
  };
}

async function postAuth(path: string, body: AuthRequestBody): Promise<AuthSession> {
  const url = `${AUTH_BASE}${path}`;
  const { data } = await axios.post<AuthApiResponse>(url, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
    withCredentials: true,
  });

  const session = toSession(data);
  saveSession(session);
  brandingConfig.applyFromClient(session.client);
  return session;
}

export async function register(input: AuthFormInput): Promise<AuthSession> {
  try {
    return await postAuth('/register', toAuthBody(input));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function login(input: AuthFormInput): Promise<AuthSession> {
  try {
    return await postAuth('/login', toAuthBody(input));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
