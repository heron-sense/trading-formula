import { api } from '../backend/api';
import type { Employee } from '../models';

export interface EmployeeListResult {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
  companyId: string;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}

interface EmployeeListApiResponse {
  success: boolean;
  message?: string;
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  companyId?: string;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}

export async function fetchEmployees(params: {
  page: number;
  pageSize: number;
  keyword?: string;
}): Promise<EmployeeListResult> {
  const response = await api.get<EmployeeListApiResponse>('/business/employees', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
    },
  });

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || '获取员工列表失败');
  }

  return {
    items: body.data || [],
    total: body.total ?? 0,
    page: body.page ?? params.page,
    pageSize: body.limit ?? params.pageSize,
    companyId: body.companyId || '',
    activeCount: body.activeCount ?? 0,
    pendingCount: body.pendingCount ?? 0,
    inactiveCount: body.inactiveCount ?? 0,
  };
}
