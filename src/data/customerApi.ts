import axios from 'axios';
import { api } from '../backend/api';
import type { CustFollowUp, Customer } from '../models';

export interface CustomerListResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}

interface CustomerListApiResponse {
  success: boolean;
  message?: string;
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}

export async function fetchCustomers(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  name?: string;
  tag?: string;
  tags?: string[];
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastContactFrom?: string;
  lastContactTo?: string;
  status?: string;
}): Promise<CustomerListResult> {
  const response = await api.get<CustomerListApiResponse>('/business/customers', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      name: params.name || undefined,
      tag: params.tag || undefined,
      tags: params.tags?.length ? params.tags.join(',') : undefined,
      registrationDateFrom: params.registrationDateFrom || undefined,
      registrationDateTo: params.registrationDateTo || undefined,
      lastContactFrom: params.lastContactFrom || undefined,
      lastContactTo: params.lastContactTo || undefined,
      status: params.status || undefined,
    },
  });

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取客户列表失败');
  }

  return {
    items: body.data || [],
    total: body.total ?? 0,
    page: body.page ?? params.page,
    pageSize: body.limit ?? params.pageSize,
    activeCount: body.activeCount ?? 0,
    pendingCount: body.pendingCount ?? 0,
    inactiveCount: body.inactiveCount ?? 0,
  };
}

export interface BatchCreateResult {
  success: boolean;
  message?: string;
  inserted: number;
  updated: number;
  failed: number;
  total: number;
  errorSamples?: string[];
}

interface BatchCreateApiResponse {
  success: boolean;
  message?: string;
  inserted: number;
  updated: number;
  failed: number;
  total: number;
  errorSamples?: string[];
}

export interface CustLabelItem {
  label: string;
  color: string;
}

export const LABEL_COLOR_OPTIONS = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#7b1fa2',
  '#00838f',
  '#5d4037',
  '#455a64',
] as const;

export const DEFAULT_LABEL_COLOR = LABEL_COLOR_OPTIONS[0];

interface CustLabelsApiResponse {
  success: boolean;
  message?: string;
  data: CustLabelItem[] | string[];
}

interface AddCustLabelApiResponse {
  success: boolean;
  message?: string;
  custId?: string;
  label?: string;
  color?: string;
  tags?: string[];
}

export interface CustLabelStat {
  label: string;
  color?: string;
  count: number;
}

export interface CustLabelStatsResult {
  items: CustLabelStat[];
  totalCust: number;
  untaggedCust: number;
}

interface CustLabelStatsApiResponse {
  success: boolean;
  message?: string;
  data: CustLabelStat[];
  totalCust?: number;
  untaggedCust?: number;
}

/** GET /api/business/cust-label-stats?cliAbbr= — customer counts per label */
export async function fetchCustLabelStats(cliAbbr: string): Promise<CustLabelStatsResult> {
  const response = await api.get<CustLabelStatsApiResponse>('/business/cust-label-stats', {
    params: { cliAbbr },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取标签统计失败');
  }
  return {
    items: Array.isArray(body.data) ? body.data : [],
    totalCust: body.totalCust ?? 0,
    untaggedCust: body.untaggedCust ?? 0,
  };
}

function normalizeCustLabelItems(data: CustLabelsApiResponse['data']): CustLabelItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === 'string') {
        return { label: item, color: DEFAULT_LABEL_COLOR };
      }
      const label = typeof item?.label === 'string' ? item.label.trim() : '';
      if (!label) return null;
      const color =
        typeof item?.color === 'string' && item.color.trim()
          ? item.color.trim()
          : DEFAULT_LABEL_COLOR;
      return { label, color };
    })
    .filter((item): item is CustLabelItem => item != null);
}

/** GET /api/business/cust-labels?cliAbbr= — distinct labels for one client */
export async function fetchCustLabels(cliAbbr: string): Promise<CustLabelItem[]> {
  const response = await api.get<CustLabelsApiResponse>('/business/cust-labels', {
    params: { cliAbbr },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取标签列表失败');
  }
  return normalizeCustLabelItems(body.data);
}

/** POST /api/business/cust-label — add label to customer (scoped by cliAbbr) */
export async function addCustLabel(
  cliAbbr: string,
  custId: string,
  label: string,
  color?: string
): Promise<{ label: string; color: string; tags: string[] }> {
  const response = await api.post<AddCustLabelApiResponse>('/business/cust-label', {
    cliAbbr,
    custId,
    label,
    color: color || undefined,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '添加标签失败');
  }
  return {
    label: body.label || label,
    color: body.color || color || DEFAULT_LABEL_COLOR,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };
}

interface DeleteCustLabelApiResponse {
  success: boolean;
  message?: string;
  label?: string;
  removedFromCustomers?: number;
}

/** DELETE /api/business/cust-label — strip from all customers, then delete catalog row */
export async function deleteCustLabel(
  cliAbbr: string,
  label: string
): Promise<{ label: string; removedFromCustomers: number }> {
  const response = await api.delete<DeleteCustLabelApiResponse>('/business/cust-label', {
    params: { cliAbbr, label },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '删除标签失败');
  }
  return {
    label: body.label || label,
    removedFromCustomers: body.removedFromCustomers ?? 0,
  };
}

interface UpdateCustSummaryApiResponse {
  success: boolean;
  message?: string;
  summary?: string;
}

/** PUT /api/business/cust-summary — update customer summary (max 100 chars) */
export async function updateCustSummary(
  custId: string,
  summary: string
): Promise<string> {
  const response = await api.put<UpdateCustSummaryApiResponse>('/business/cust-summary', {
    custId,
    summary,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '更新概要失败');
  }
  return body.summary ?? summary;
}

interface UpdateCustProfileApiResponse {
  success: boolean;
  message?: string;
  name?: string;
  phone?: string;
  email?: string;
}

/** PUT /api/business/cust-profile — update name / phone / email */
export async function updateCustProfile(
  custId: string,
  profile: { name: string; phone: string; email: string }
): Promise<{ name: string; phone: string; email: string }> {
  const response = await api.put<UpdateCustProfileApiResponse>('/business/cust-profile', {
    custId,
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '更新客户信息失败');
  }
  return {
    name: body.name ?? profile.name,
    phone: body.phone ?? profile.phone,
    email: body.email ?? profile.email,
  };
}

interface AddCustFollowUpApiResponse {
  success: boolean;
  message?: string;
  followUps?: CustFollowUp[];
}

interface CustStatusesApiResponse {
  success: boolean;
  message?: string;
  data: string[];
}

/** GET /api/business/cust-statuses?cliAbbr= — status catalog for one client */
export async function fetchCustStatuses(cliAbbr: string): Promise<string[]> {
  const response = await api.get<CustStatusesApiResponse>('/business/cust-statuses', {
    params: { cliAbbr },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取状态列表失败');
  }
  return Array.isArray(body.data) ? body.data : [];
}

interface UpdateCustStatusApiResponse {
  success: boolean;
  message?: string;
  status?: string;
}

/** PUT /api/business/cust-customer-status — update customer status */
export async function updateCustStatus(
  cliAbbr: string,
  custId: string,
  status: string
): Promise<string> {
  const response = await api.put<UpdateCustStatusApiResponse>('/business/cust-customer-status', {
    cliAbbr,
    custId,
    status,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '更新状态失败');
  }
  return body.status || status;
}

export interface CustStatusStat {
  status: string;
  count: number;
}

interface CustStatusStatsApiResponse {
  success: boolean;
  message?: string;
  data: CustStatusStat[];
}

/** GET /api/business/cust-status-stats?cliAbbr= */
export async function fetchCustStatusStats(cliAbbr: string): Promise<CustStatusStat[]> {
  const response = await api.get<CustStatusStatsApiResponse>('/business/cust-status-stats', {
    params: { cliAbbr },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取状态统计失败');
  }
  return Array.isArray(body.data) ? body.data : [];
}

interface AddCustStatusDefApiResponse {
  success: boolean;
  message?: string;
  status?: string;
}

/** POST /api/business/cust-status-def — add status to catalog */
export async function addCustStatusDef(cliAbbr: string, status: string): Promise<string> {
  const response = await api.post<AddCustStatusDefApiResponse>('/business/cust-status-def', {
    cliAbbr,
    status,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '新增状态失败');
  }
  return body.status || status;
}

interface DeleteCustStatusDefApiResponse {
  success: boolean;
  message?: string;
  status?: string;
  reassignedTo?: string;
  reassignedFromCustomers?: number;
}

/** DELETE /api/business/cust-status-def — delete catalog status and reassign customers */
export async function deleteCustStatusDef(
  cliAbbr: string,
  status: string
): Promise<{ status: string; reassignedTo: string; reassignedFromCustomers: number }> {
  const response = await api.delete<DeleteCustStatusDefApiResponse>('/business/cust-status-def', {
    params: { cliAbbr, status },
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '删除状态失败');
  }
  return {
    status: body.status || status,
    reassignedTo: body.reassignedTo || '',
    reassignedFromCustomers: body.reassignedFromCustomers ?? 0,
  };
}

/** POST /api/business/cust-follow-up — add a follow-up note with optional createdAt */
export async function addCustFollowUp(
  custId: string,
  content: string,
  options?: { createdBy?: string; createdAt?: string }
): Promise<CustFollowUp[]> {
  const response = await api.post<AddCustFollowUpApiResponse>('/business/cust-follow-up', {
    custId,
    content,
    createdBy: options?.createdBy || undefined,
    createdAt: options?.createdAt || undefined,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '添加跟进记录失败');
  }
  return Array.isArray(body.followUps) ? body.followUps : [];
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  status?: string;
  summary?: string;
  tags?: string[];
}

function todayLocalDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function newCustomerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cust_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function batchErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: string }).message;
      if (message) return message;
    }
    if (
      error.message &&
      error.message !== 'Network Error' &&
      !/^Request failed with status code \d+$/.test(error.message)
    ) {
      return error.message;
    }
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** POST /api/business/customers/batch — persist one new customer. */
export async function createCustomer(input: CreateCustomerInput): Promise<void> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('姓名不能为空');
  }
  const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  const customer: Customer = {
    id: newCustomerId(),
    name,
    email: (input.email ?? '').trim(),
    phone: (input.phone ?? '').trim(),
    company: (input.company ?? '').trim(),
    location: (input.location ?? '').trim(),
    status: (input.status ?? '').trim(),
    registrationDate: todayLocalDate(),
    lastContact: '',
    summary: input.summary?.trim() || undefined,
    tags: tags.length ? tags : undefined,
  };

  let result: BatchCreateResult;
  try {
    result = await batchCreateCustomers([customer]);
  } catch (error) {
    throw new Error(batchErrorMessage(error, '保存客户失败'));
  }
  if (!result.success || result.failed > 0 || result.inserted !== 1) {
    const detail =
      result.errorSamples?.filter(Boolean).join('\n') || result.message || '保存客户失败';
    throw new Error(detail);
  }
}

export async function batchCreateCustomers(
  customers: Customer[]
): Promise<BatchCreateResult> {
  // Large CSV imports (e.g. 2000 rows) need a longer timeout than the default 10s.
  const response = await api.post<BatchCreateApiResponse>(
    '/business/customers/batch',
    { customers },
    { timeout: 120000 }
  );
  const body = response.data;
  if (!body) {
    throw new Error('提交失败：空响应');
  }
  return {
    success: Boolean(body.success),
    message: body.message,
    inserted: body.inserted ?? 0,
    updated: body.updated ?? 0,
    failed: body.failed ?? 0,
    total: body.total ?? customers.length,
    errorSamples: body.errorSamples,
  };
}

interface BatchAssignApiResponse {
  success: boolean;
  message?: string;
  updated?: number;
  ownerId?: string;
  ownerName?: string;
}

/** POST /api/business/customers/batch-assign — assign selected customers to an employee */
export async function batchAssignCustomers(
  custIds: string[],
  owner: { ownerId: string; ownerName: string }
): Promise<{ updated: number; ownerId: string; ownerName: string }> {
  const response = await api.post<BatchAssignApiResponse>('/business/customers/batch-assign', {
    custIds,
    ownerId: owner.ownerId,
    ownerName: owner.ownerName,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '指派失败');
  }
  return {
    updated: body.updated ?? 0,
    ownerId: body.ownerId || owner.ownerId,
    ownerName: body.ownerName || owner.ownerName,
  };
}

interface BatchDeleteApiResponse {
  success: boolean;
  message?: string;
  deleted?: number;
}

/** POST /api/business/customers/batch-delete — delete selected customers */
export async function batchDeleteCustomers(custIds: string[]): Promise<number> {
  const response = await api.post<BatchDeleteApiResponse>('/business/customers/batch-delete', {
    custIds,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '批量删除失败');
  }
  return body.deleted ?? 0;
}

/** ACL operation codes for label / status management / profile edit entry points. */
export const OP_CUST_LABEL_MANAGE = 'DELETE/api/business/cust-label';
export const OP_CUST_STATUS_MANAGE = 'POST/api/business/cust-status-def';
export const OP_CUST_PROFILE_EDIT = 'PUT/api/business/cust-profile';

interface CheckOperationsApiResponse {
  success: boolean;
  message?: string;
  authorized: Record<string, boolean>;
}

/** POST /api/business/check-operations — probe EdDSA ACL for listed operation codes. */
export async function checkOperations(operations: string[]): Promise<Record<string, boolean>> {
  const response = await api.post<CheckOperationsApiResponse>('/business/check-operations', {
    operations,
  });
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '权限检查失败');
  }
  return body.authorized ?? {};
}
