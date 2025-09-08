// 自定义Hooks - 数据管理和状态处理
import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse, PaginationParams, SearchParams } from '../services/api';
import { User, Customer, Product, DashboardStats, Notification, Stock, Position, StockMetrics, RelatedStock, PortfolioOverview, PriceDataPoint, TradeRecord } from '../models';
import { mockApi } from './mockApi';

// 通用状态类型
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 分页状态类型
interface UsePaginatedApiState<T> {
  data: PaginatedResponse<T> | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 通用API Hook
function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setData(null);
        setError(response.message);
      }
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 分页API Hook
function usePaginatedApi<T>(
  apiCall: (params: PaginationParams & SearchParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialParams: PaginationParams & SearchParams = { page: 1, pageSize: 10 }
): UsePaginatedApiState<T> & {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchParams: (params: SearchParams) => void;
  refetch: () => void;
} {
  const [params, setParams] = useState<PaginationParams & SearchParams>(initialParams);
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: null,
    loading: true,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall(params);
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          pagination: {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total,
            totalPages: response.data.totalPages
          }
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '请求失败'
      }));
    }
  }, [apiCall, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setParams(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSearchParams = useCallback((searchParams: SearchParams) => {
    setParams(prev => ({ ...prev, ...searchParams, page: 1 }));
  }, []);

  return {
    ...state,
    setPage,
    setPageSize,
    setSearchParams,
    refetch: fetchData
  };
}

// 用户相关Hooks
export const useUsers = (params: PaginationParams & SearchParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<User>(
    (p) => mockApi.users.getUsers(p),
    params
  );
};

export const useUser = (id: string) => {
  return useApi<User>(
    () => mockApi.users.getUserById(id),
    [id]
  );
};

// 客户相关Hooks
export const useCustomers = (params: PaginationParams & SearchParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<Customer>(
    (p) => mockApi.customers.getCustomers(p),
    params
  );
};

export const useCustomer = (id: string) => {
  return useApi<Customer>(
    () => mockApi.customers.getCustomerById(id),
    [id]
  );
};

// 产品相关Hooks
export const useProducts = (params: PaginationParams & SearchParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<Product>(
    (p) => mockApi.products.getProducts(p),
    params
  );
};

export const useProduct = (id: string) => {
  return useApi<Product>(
    () => mockApi.products.getProductById(id),
    [id]
  );
};

// 仪表板相关Hooks
export const useDashboardStats = () => {
  return useApi<DashboardStats>(
    () => mockApi.dashboard.getStats(),
    []
  );
};

// 通知相关Hooks
export const useNotifications = (params: PaginationParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<Notification>(
    (p) => mockApi.notifications.getNotifications(p),
    params
  );
};

// 操作Hooks（用于创建、更新、删除操作）
export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.users.createUser(userData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建用户失败';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.users.updateUser(id, userData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户失败';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.users.deleteUser(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除用户失败';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  };
};

export const useCustomerOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(async (customerData: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.customers.createCustomer(customerData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建客户失败';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.customers.updateCustomer(id, customerData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新客户失败';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.customers.deleteCustomer(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除客户失败';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};

// 美股证券相关Hooks
export const useStocks = (params: PaginationParams & SearchParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<Stock>(
    (p) => mockApi.stocks.getStocks(p),
    params
  );
};

export const useStock = (symbol: string) => {
  return useApi<Stock>(
    () => mockApi.stocks.getStockBySymbol(symbol),
    [symbol]
  );
};

export const usePositions = (params: PaginationParams & SearchParams = { page: 1, pageSize: 10 }) => {
  return usePaginatedApi<Position>(
    (p) => mockApi.stocks.getPositions(p),
    params
  );
};

export const usePortfolioOverview = () => {
  return useApi<PortfolioOverview>(
    () => mockApi.stocks.getPortfolioOverview(),
    []
  );
};

export const useStockMetrics = (symbol: string) => {
  return useApi<StockMetrics>(
    () => mockApi.stocks.getStockMetrics(symbol),
    [symbol]
  );
};

export const useRelatedStocks = (symbol: string, count: number = 5) => {
  return useApi<RelatedStock[]>(
    () => mockApi.stocks.getRelatedStocks(symbol, count),
    [symbol, count]
  );
};

export const usePriceHistory = (symbol: string, days: number = 30) => {
  return useApi<PriceDataPoint[]>(
    () => mockApi.stocks.getPriceHistory(symbol, days),
    [symbol, days]
  );
};

export const useTradeRecords = (symbol: string) => {
  return useApi<TradeRecord[]>(
    () => mockApi.stocks.getTradeRecords(symbol),
    [symbol]
  );
};

// 导出所有Hooks
export {
  useApi,
  usePaginatedApi
};
