// API基础配置和请求封装
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ensureAccessTokenOrRedirect,
  getAccessToken,
  getAuthUser,
  redirectToLogin,
  clearSession,
} from '../auth/session';

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 搜索参数
export interface SearchParams {
  keyword?: string;
  [key: string]: any;
}

function requestUrl(config?: { url?: string; baseURL?: string }): string {
  const base = config?.baseURL || '';
  const url = config?.url || '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${base}${url}`;
}

// 创建axios实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: any) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const user = getAuthUser();
      if (user?.id) {
        config.headers['X-User-Id'] = user.id;
      }

      config.metadata = { startTime: new Date() };

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      return config;
    },
    (error: any) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const duration =
        new Date().getTime() - (response.config.metadata?.startTime?.getTime() || 0);
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
        response.data
      );

      ensureAccessTokenOrRedirect(requestUrl(response.config));
      return response;
    },
    (error: any) => {
      const duration =
        new Date().getTime() - (error.config?.metadata?.startTime?.getTime() || 0);
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`,
        error.response?.data || error.message
      );

      if (error.config) {
        ensureAccessTokenOrRedirect(requestUrl(error.config));
      }

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            clearSession();
            redirectToLogin();
            break;
          case 403:
            console.error('权限不足');
            break;
          case 404:
            console.error('资源不存在');
            break;
          case 500:
            console.error('服务器内部错误');
            break;
          default:
            console.error(`请求失败: ${data?.message || error.message}`);
        }
      } else if (error.request) {
        console.error('网络错误，请检查网络连接');
      } else {
        console.error('请求配置错误:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建API实例
export const api = createApiInstance();

// 通用API方法
export class ApiService {
  // GET请求
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // POST请求
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT请求
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE请求
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // PATCH请求
  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

// 扩展axios类型以支持metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

export default ApiService;
