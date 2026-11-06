export interface ParsedEdDSAUser {
  id: string;
  reference_id?: string;
  name: string;
  cli_abbr: string;
  email_addr: string;
  enabled: string;
  roleIds: string[];
}

export interface ParsedEdDSARole {
  name: string;
  referenceId: string;
  permissionCount: number;
  userIds: string[];
}

export interface ParsedEdDSAUserList {
  users: ParsedEdDSAUser[];
  roles: ParsedEdDSARole[];
}

function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function roleIdsOf(value: unknown): string[] {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = text(value);
    return id ? [id] : [];
  }
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const item of value) {
    const id = text(item);
    if (id) ids.push(id);
  }
  return ids;
}

function parseUser(raw: unknown): ParsedEdDSAUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = text(row.id);
  if (!id) return null;
  const referenceId = text(row.reference_id);
  return {
    id,
    reference_id: referenceId || undefined,
    name: text(row.name),
    cli_abbr: text(row.cli_abbr),
    email_addr: text(row.email_addr),
    enabled: text(row.enabled),
    roleIds: roleIdsOf(row.role_id ?? row.roleIds),
  };
}

function parseRole(raw: unknown): ParsedEdDSARole | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const name = text(row.name ?? row.role ?? row.role_name ?? row.roleName);
  if (!name) return null;
  const referenceId = text(row.lrid ?? row.reference_id ?? row.referenceId);
  const permissions = row.permissions ?? row.authorized_operation;
  return {
    name,
    referenceId,
    permissionCount: Array.isArray(permissions) ? permissions.length : 0,
    userIds: [],
  };
}

/** Users payload: { users: [{ role_id }], roles: [{ name, lrid }] }. */
export function parseEdDSAUsersBody(data: unknown): ParsedEdDSAUserList {
  if (!data || typeof data !== 'object') return { users: [], roles: [] };
  const body = data as Record<string, unknown>;
  const users = Array.isArray(body.users)
    ? body.users.map(parseUser).filter((user): user is ParsedEdDSAUser => user != null)
    : [];
  const roles = Array.isArray(body.roles)
    ? body.roles.map(parseRole).filter((role): role is ParsedEdDSARole => role != null)
    : [];
  return { users, roles };
}

/**
 * role_id entries that match a role lrid become that role's name.
 * Entries that are not in the catalog, such as "admin", stay as their own label.
 * The same display name is kept once.
 */
/**
 * The one role id stored on a user. Prefer a catalog lrid over a bare label such as "admin".
 * Users may select only one role, so callers use this id for assignee and for the role editor.
 */
export function singleRoleId(
  roleIds: readonly string[],
  roles: readonly { referenceId: string }[]
): string {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const raw of roleIds) {
    const id = raw.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  const catalog = new Set<string>();
  for (const role of roles) {
    if (role.referenceId) catalog.add(role.referenceId);
  }
  const matched = ids.find((id) => catalog.has(id));
  if (matched) return matched;
  return ids[0] ?? '';
}

export function resolveRoleNames(
  roleIds: readonly string[],
  roles: readonly { name: string; referenceId: string }[]
): string[] {
  const byRef = new Map<string, string>();
  for (const role of roles) {
    if (role.referenceId && role.name && !byRef.has(role.referenceId)) {
      byRef.set(role.referenceId, role.name);
    }
  }
  const names: string[] = [];
  const seen = new Set<string>();
  for (const raw of roleIds) {
    const id = raw.trim();
    if (!id) continue;
    const name = byRef.get(id) ?? id;
    if (seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

function roleKey(role: { name: string; referenceId: string }): string {
  if (role.referenceId) return `id:${role.referenceId}`;
  if (role.name) return `name:${role.name}`;
  return '';
}

/** primary overwrites extra when the reference id or name key matches. */
export function mergeEdDSARoles<T extends { name: string; referenceId: string }>(
  primary: readonly T[],
  extra: readonly T[]
): T[] {
  const merged = new Map<string, T>();
  for (const role of extra) {
    const key = roleKey(role);
    if (key) merged.set(key, role);
  }
  for (const role of primary) {
    const key = roleKey(role);
    if (key) merged.set(key, role);
  }
  return [...merged.values()];
}
