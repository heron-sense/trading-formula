import { api } from '../backend/api';
import type { Customer } from '../models';

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
}): Promise<CustomerListResult> {
  const response = await api.get<CustomerListApiResponse>('/business/customers', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
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
