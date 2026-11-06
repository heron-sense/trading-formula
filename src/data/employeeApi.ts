import axios from 'axios';
import { getAccessToken, getAuthUser } from '../auth/session';
import { api } from '../backend/api';
import { parseEdDSAUsersBody } from './eddsaUserRoles';

export { mergeEdDSARoles, resolveRoleNames, singleRoleId } from './eddsaUserRoles';

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || '/api/EdDSA-island';
const CLI_ABBR_KEY = 'cli_abbr';
const MAX_CLI_ABBR_LEN = 32;

/** EdDSA UserRecord from POST /users */
export interface EdDSAUser {
  id: string;
  reference_id?: string;
  name: string;
  cli_abbr: string;
  email_addr: string;
  enabled: string;
  /** Role identifiers from the users payload. Values are role names or role lrids. */
  roleIds: string[];
}

export interface EdDSAUserList {
  users: EdDSAUser[];
  roles: EdDSARole[];
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

export interface SaveEdDSARoleInput {
  cliAbbr: string;
  name: string;
  referenceIds: string[];
}

function eddsaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * PUT /api/EdDSA-island/role — create or replace a role and its authorized operations.
 * authorized_operation items use the checked operation_code values.
 */
export async function saveEdDSARole(input: SaveEdDSARoleInput): Promise<void> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('角色名称不能为空');
  }
  const abbr = validateCliAbbr(input.cliAbbr);
  const accessToken = getAccessToken()?.trim() ?? '';
  const userId = getAuthUser()?.id?.trim() ?? '';
  if (!accessToken || !userId) {
    throw new Error('登录会话缺少 access_token 或 user_id，请重新登录');
  }
  try {
    const { data } = await axios.put(
      `${AUTH_BASE}/role`,
      {
        access_token: accessToken,
        user_id: userId,
        cli_abbr: abbr,
        name,
        authorized_operation: input.referenceIds.map((referenceId) => ({
          operation_code: referenceId,
        })),
      },
      {
        headers: eddsaHeaders(),
        timeout: 15000,
        withCredentials: true,
      }
    );
    if (data && typeof data === 'object' && 'success' in data && (data as { success?: boolean }).success === false) {
      throw new Error((data as { message?: string }).message || '保存角色失败');
    }
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }
    const message = extractErrorMessage(error);
    if (!message || message === '获取员工列表失败' || /^Request failed with status code \d+$/.test(message)) {
      throw new Error('保存角色失败');
    }
    throw new Error(message);
  }
}

export interface EdDSARoleOperation {
  operationCode: string;
  name: string;
  description: string;
  authorized: boolean;
}

function textField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function operationCodeOf(row: Record<string, unknown>): string {
  return textField(row, ['operation_code', 'operationCode', 'reference_id', 'referenceId', 'code']);
}

function operationAuthorized(row: Record<string, unknown>): boolean {
  if (row.authorized === true || row.granted === true || row.checked === true) return true;
  const status = textField(row, ['status', 'state', 'auth_status', 'authStatus']).toLowerCase();
  return status === 'authorized' || status === 'granted' || status === '已授权';
}

function toRoleOperation(raw: unknown, authorized: boolean): EdDSARoleOperation | null {
  if (typeof raw === 'string') {
    const operationCode = raw.trim();
    return operationCode ? { operationCode, name: '', description: '', authorized } : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const operationCode = operationCodeOf(row);
  if (!operationCode) return null;
  return {
    operationCode,
    name: textField(row, ['name', 'permission_name', 'permissionName', 'title']),
    description: textField(row, ['notes', 'description', 'desc', 'function_description', 'functionDescription']),
    authorized: authorized || operationAuthorized(row),
  };
}

function arrayField(body: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    if (Array.isArray(body[key])) return body[key] as unknown[];
  }
  return [];
}

function roleDetailBody(data: unknown): Record<string, unknown> {
  if (Array.isArray(data)) return { operations: data };
  if (!data || typeof data !== 'object') return {};
  const body = data as Record<string, unknown>;
  if (body.success === false) {
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    throw new Error(message || '获取权限列表失败');
  }
  const nested = body.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...body, ...(nested as Record<string, unknown>) };
  }
  if (Array.isArray(nested)) return { ...body, operations: nested };
  return body;
}

function parseRoleOperations(data: unknown): EdDSARoleOperation[] {
  const body = roleDetailBody(data);
  const authorizedRows = arrayField(body, ['authorized_operation', 'authorized_operations']);
  const authorizedCodes = new Set(
    authorizedRows
      .map((row) => toRoleOperation(row, true)?.operationCode)
      .filter((code): code is string => Boolean(code))
  );
  const catalogRows = arrayField(body, ['candidate_operation', 'candidate_operations']);
  const merged = new Map<string, EdDSARoleOperation>();
  for (const row of catalogRows) {
    const operation = toRoleOperation(row, false);
    if (!operation) continue;
    if (authorizedCodes.has(operation.operationCode)) operation.authorized = true;
    const existing = merged.get(operation.operationCode);
    if (!existing) {
      merged.set(operation.operationCode, operation);
      continue;
    }
    existing.authorized = existing.authorized || operation.authorized;
    if (!existing.name) existing.name = operation.name;
    if (!existing.description) existing.description = operation.description;
  }
  return [...merged.values()];
}

/** PUT /api/EdDSA-island/role/detail. role_reference_id loads that role's authorized_operation. */
export async function fetchEdDSARoleDetail(roleReferenceId = ''): Promise<EdDSARoleOperation[]> {
  const accessToken = getAccessToken()?.trim() ?? '';
  const userId = getAuthUser()?.id?.trim() ?? '';
  if (!accessToken || !userId) {
    throw new Error('登录会话缺少 access_token 或 user_id，请重新登录');
  }
  const roleId = roleReferenceId.trim();
  try {
    const { data } = await axios.put(
      `${AUTH_BASE}/role/detail`,
      {
        access_token: accessToken,
        user_id: userId,
        ...(roleId ? { role_reference_id: roleId } : {}),
      },
      {
        headers: eddsaHeaders(),
        timeout: 15000,
        withCredentials: true,
      }
    );
    return parseRoleOperations(data);
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }
    const message = extractErrorMessage(error);
    if (!message || message === '获取员工列表失败' || /^Request failed with status code \d+$/.test(message)) {
      throw new Error('获取权限列表失败');
    }
    throw new Error(message);
  }
}

export interface EdDSARole {
  name: string;
  referenceId: string;
  permissionCount: number;
  userIds: string[];
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const id = item.trim();
      if (id) ids.push(id);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const raw = row.user_id ?? row.userId ?? row.id;
    if (typeof raw === 'string' && raw.trim()) ids.push(raw.trim());
  }
  return ids;
}

function roleListRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const body = data as Record<string, unknown>;
  if (body.success === false) {
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    throw new Error(message || '获取角色列表失败');
  }
  for (const key of ['roles', 'data', 'items']) {
    if (Array.isArray(body[key])) return body[key] as unknown[];
  }
  return [];
}

function toEdDSARole(raw: unknown): EdDSARole | null {
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? { name, referenceId: '', permissionCount: 0, userIds: [] } : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const nameValue = row.name ?? row.role ?? row.role_name ?? row.roleName;
    const name = typeof nameValue === 'string' ? nameValue.trim() : '';
  if (!name) return null;
  const referenceValue = row.lrid ?? row.reference_id ?? row.referenceId;
  const referenceId = typeof referenceValue === 'string' ? referenceValue.trim() : '';
  const permissions = row.permissions ?? row.authorized_operation;
  return {
    name,
    referenceId,
    permissionCount: Array.isArray(permissions) ? permissions.length : 0,
    userIds: stringIds(row.user_ids ?? row.userIds ?? row.users ?? row.assignments),
  };
}

/** POST /api/EdDSA-island/roles with JSON body { access_token, user_id }. */
export async function fetchEdDSARoles(): Promise<EdDSARole[]> {
  const accessToken = getAccessToken()?.trim() ?? '';
  const userId = getAuthUser()?.id?.trim() ?? '';
  if (!accessToken || !userId) {
    throw new Error('登录会话缺少 access_token 或 user_id，请重新登录');
  }
  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/roles`,
      {
        access_token: accessToken,
        user_id: userId,
      },
      {
        headers: eddsaHeaders(),
        timeout: 15000,
        withCredentials: true,
      }
    );
    return roleListRows(data)
      .map(toEdDSARole)
      .filter((role): role is EdDSARole => role != null);
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }
    const message = extractErrorMessage(error);
    if (!message || message === '获取员工列表失败' || /^Request failed with status code \d+$/.test(message)) {
      throw new Error('获取角色列表失败');
    }
    throw new Error(message);
  }
}

export interface AssignEdDSAUserRoleInput {
  roleReferenceId: string;
  userReferenceId: string;
}

/** PUT /api/EdDSA-island/user/role — assign a role reference to a user reference. */
export async function assignEdDSAUserRole(input: AssignEdDSAUserRoleInput): Promise<void> {
  const accessToken = getAccessToken()?.trim() ?? '';
  const userId = getAuthUser()?.id?.trim() ?? '';
  const roleReferenceId = input.roleReferenceId.trim();
  const userReferenceId = input.userReferenceId.trim();
  if (!accessToken || !userId) {
    throw new Error('登录会话缺少 access_token 或 user_id，请重新登录');
  }
  if (!roleReferenceId) {
    throw new Error('请选择角色');
  }
  if (!userReferenceId) {
    throw new Error('该员工缺少 reference_id，无法指定角色');
  }
  try {
    const { data } = await axios.put(
      `${AUTH_BASE}/user/role`,
      {
        access_token: accessToken,
        user_id: userId,
        to_assign_role_ref_id: roleReferenceId,
        to_assign_user_ref_id: userReferenceId,
      },
      {
        headers: eddsaHeaders(),
        timeout: 15000,
        withCredentials: true,
      }
    );
    if (data && typeof data === 'object' && 'success' in data && (data as { success?: boolean }).success === false) {
      throw new Error((data as { message?: string }).message || '指定角色失败');
    }
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }
    const message = extractErrorMessage(error);
    if (!message || message === '获取员工列表失败' || /^Request failed with status code \d+$/.test(message)) {
      throw new Error('指定角色失败');
    }
    throw new Error(message);
  }
}

/** POST /api/EdDSA-island/users — users plus the role catalog used to resolve role_id. */
export async function fetchEdDSAUserList(cliAbbr: string): Promise<EdDSAUserList> {
  const abbr = validateCliAbbr(cliAbbr);
  storeCliAbbr(abbr);

  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/users`,
      { cli_abbr: abbr },
      {
        headers: eddsaHeaders(),
        timeout: 15000,
        withCredentials: true,
      }
    );
    return parseEdDSAUsersBody(data);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/** POST /api/EdDSA-island/users — list users by company cli_abbr */
export async function fetchUsersByCliAbbr(cliAbbr: string): Promise<EdDSAUser[]> {
  const { users } = await fetchEdDSAUserList(cliAbbr);
  return users;
}

export function isUserEnabled(enabled: string): boolean {
  const v = enabled.trim().toLowerCase();
  return v === 't' || v === 'true' || v === '1' || v === 'yes' || v === 'y' || v === '启用';
}

export interface StaffRoleStat {
  role: string;
  count: number;
}

export interface StaffRoleAssignment {
  userId: string;
  role: string;
}

export interface StaffRolesResult {
  roles: StaffRoleStat[];
  assignments: StaffRoleAssignment[];
}

interface StaffRolesApiResponse {
  success: boolean;
  message?: string;
  data?: StaffRoleStat[];
  assignments?: StaffRoleAssignment[];
}

interface StaffRoleMutationResponse {
  success: boolean;
  message?: string;
  role?: string;
  clearedFromUsers?: number;
}

/** GET /api/business/staff-roles?cliAbbr= */
export async function fetchStaffRoles(cliAbbr: string): Promise<StaffRolesResult> {
  const abbr = validateCliAbbr(cliAbbr);
  try {
    const response = await api.get<StaffRolesApiResponse>('/business/staff-roles', {
      params: { cliAbbr: abbr },
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || '获取角色列表失败');
    }
    return {
      roles: Array.isArray(body.data) ? body.data : [],
      assignments: Array.isArray(body.assignments) ? body.assignments : [],
    };
  } catch (error) {
    if (error instanceof Error && error.message !== '获取角色列表失败') {
      const message = extractErrorMessage(error);
      throw new Error(message === '获取员工列表失败' ? '获取角色列表失败' : message);
    }
    throw error;
  }
}

function staffRoleError(error: unknown, fallback: string): Error {
  const message = extractErrorMessage(error);
  if (!message || message === '获取员工列表失败') return new Error(fallback);
  return new Error(message);
}

/** POST /api/business/staff-role */
export async function addStaffRole(cliAbbr: string, role: string): Promise<string> {
  try {
    const response = await api.post<StaffRoleMutationResponse>('/business/staff-role', {
      cliAbbr: validateCliAbbr(cliAbbr),
      role,
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || '新增角色失败');
    }
    return body.role || role.trim();
  } catch (error) {
    throw staffRoleError(error, '新增角色失败');
  }
}

/** DELETE /api/business/staff-role */
export async function deleteStaffRole(
  cliAbbr: string,
  role: string
): Promise<{ role: string; clearedFromUsers: number }> {
  try {
    const response = await api.delete<StaffRoleMutationResponse>('/business/staff-role', {
      params: { cliAbbr: validateCliAbbr(cliAbbr), role },
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || '删除角色失败');
    }
    return {
      role: body.role || role,
      clearedFromUsers: body.clearedFromUsers ?? 0,
    };
  } catch (error) {
    throw staffRoleError(error, '删除角色失败');
  }
}

/** PUT /api/business/user-staff-role — empty role clears the assignment. */
export async function updateUserStaffRole(
  cliAbbr: string,
  userId: string,
  role: string
): Promise<string> {
  try {
    const response = await api.put<StaffRoleMutationResponse>('/business/user-staff-role', {
      cliAbbr: validateCliAbbr(cliAbbr),
      userId,
      role,
    });
    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || '更新员工角色失败');
    }
    return body.role ?? role.trim();
  } catch (error) {
    throw staffRoleError(error, '更新员工角色失败');
  }
}
