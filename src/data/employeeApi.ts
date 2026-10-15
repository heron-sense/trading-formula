import axios from 'axios';
import { getAccessToken } from '../auth/session';

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || '/api/EdDSA-island';
const CLI_ABBR_KEY = 'cli_abbr';
const MAX_CLI_ABBR_LEN = 32;

/** EdDSA UserRecord from POST /users */
export interface EdDSAUser {
  id: string;
  name: string;
  cli_abbr: string;
  email_addr: string;
  enabled: string;
}

interface UsersApiResponse {
  users?: EdDSAUser[];
}

export function getStoredCliAbbr(): string {
  return (localStorage.getItem(CLI_ABBR_KEY) || '').trim();
}

export function storeCliAbbr(value: string): void {
  const abbr = value.trim();
  if (abbr) {
    localStorage.setItem(CLI_ABBR_KEY, abbr);
  } else {
    localStorage.removeItem(CLI_ABBR_KEY);
  }
}

export function validateCliAbbr(value: string): string {
  const abbr = value.trim();
  if (!abbr) {
    throw new Error('cli_abbr is required');
  }
  if (abbr.length > MAX_CLI_ABBR_LEN) {
    throw new Error(`cli_abbr must be at most ${MAX_CLI_ABBR_LEN} characters`);
  }
  return abbr;
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
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return '获取员工列表失败';
}

/** POST /api/EdDSA-island/users — list users by company cli_abbr */
export async function fetchUsersByCliAbbr(cliAbbr: string): Promise<EdDSAUser[]> {
  const abbr = validateCliAbbr(cliAbbr);
  storeCliAbbr(abbr);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const { data } = await axios.post<UsersApiResponse>(
      `${AUTH_BASE}/users`,
      { cli_abbr: abbr },
      {
        headers,
        timeout: 15000,
        withCredentials: true,
      }
    );
    return Array.isArray(data?.users) ? data.users : [];
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export function isUserEnabled(enabled: string): boolean {
  const v = enabled.trim().toLowerCase();
  return v === 't' || v === 'true' || v === '1' || v === 'yes' || v === 'y' || v === '启用';
}
