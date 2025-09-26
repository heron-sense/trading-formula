// Mock API服务 - 模拟后端API响应
import { ApiResponse, PaginatedResponse, PaginationParams, SearchParams } from '../backend/api';
import { 
  User, Customer, Product, Order, DashboardStats, Notification, LogEntry,
  Stock, Position, StockMetrics, RelatedStock, PortfolioOverview,
  PriceDataPoint, TradeRecord
} from '../models';
import { generateMockData } from './mockData';

// 全局Mock数据存储
let mockData = generateMockData();

// 模拟网络延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟分页
const paginate = <T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize)
  };
};

// 模拟搜索
const search = <T>(items: T[], searchParams: SearchParams, searchFields: string[]): T[] => {
  if (!searchParams.keyword) return items;
  
  const keyword = searchParams.keyword.toLowerCase();
  return items.filter(item => {
    return searchFields.some(field => {
      const value = (item as any)[field];
      return value && value.toString().toLowerCase().includes(keyword);
    });
  });
};

// 用户相关API
export const mockUserApi = {
  // 获取用户列表
  getUsers: async (params: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    await delay();
    
    let users = [...mockData.users];
    
    // 搜索
    if (params.keyword) {
      users = search(users, params, ['name', 'email', 'username']);
    }
    
    // 分页
    const result = paginate(users, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取用户列表成功',
      data: result,
      success: true
    };
  },

  // 获取用户详情
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    await delay();
    
    const user = mockData.users.find(u => u.id === id);
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null as any,
        success: false
      };
    }
    
    return {
      code: 200,
      message: '获取用户详情成功',
      data: user,
      success: true
    };
  },

  // 创建用户
  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    await delay();
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: userData.username || '',
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'user',
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };
    
    mockData.users.push(newUser);
    
    return {
      code: 201,
      message: '创建用户成功',
      data: newUser,
      success: true
    };
  },

  // 更新用户
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    await delay();
    
    const userIndex = mockData.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return {
        code: 404,
        message: '用户不存在',
        data: null as any,
        success: false
      };
    }
    
    mockData.users[userIndex] = {
      ...mockData.users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      code: 200,
      message: '更新用户成功',
      data: mockData.users[userIndex],
      success: true
    };
  },

  // 删除用户
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    
    const userIndex = mockData.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return {
        code: 404,
        message: '用户不存在',
        data: null,
        success: false
      };
    }
    
    mockData.users.splice(userIndex, 1);
    
    return {
      code: 200,
      message: '删除用户成功',
      data: null,
      success: true
    };
  }
};

// 客户相关API
export const mockCustomerApi = {
  // 获取客户列表
  getCustomers: async (params: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<Customer>>> => {
    await delay();
    
    let customers = [...mockData.customers];
    
    // 搜索
    if (params.keyword) {
      customers = search(customers, params, ['name', 'email', 'company', 'phone']);
    }
    
    // 分页
    const result = paginate(customers, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取客户列表成功',
      data: result,
      success: true
    };
  },

  // 获取客户详情
  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    await delay();
    
    const customer = mockData.customers.find(c => c.id === id);
    if (!customer) {
      return {
        code: 404,
        message: '客户不存在',
        data: null as any,
        success: false
      };
    }
    
    return {
      code: 200,
      message: '获取客户详情成功',
      data: customer,
      success: true
    };
  },

  // 创建客户
  createCustomer: async (customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    await delay();
    
    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      company: customerData.company || '',
      status: customerData.status || 'active',
      location: customerData.location || '',
      registrationDate: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      ...customerData
    };
    
    mockData.customers.push(newCustomer);
    
    return {
      code: 201,
      message: '创建客户成功',
      data: newCustomer,
      success: true
    };
  },

  // 更新客户
  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    await delay();
    
    const customerIndex = mockData.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return {
        code: 404,
        message: '客户不存在',
        data: null as any,
        success: false
      };
    }
    
    mockData.customers[customerIndex] = {
      ...mockData.customers[customerIndex],
      ...customerData
    };
    
    return {
      code: 200,
      message: '更新客户成功',
      data: mockData.customers[customerIndex],
      success: true
    };
  },

  // 删除客户
  deleteCustomer: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    
    const customerIndex = mockData.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return {
        code: 404,
        message: '客户不存在',
        data: null,
        success: false
      };
    }
    
    mockData.customers.splice(customerIndex, 1);
    
    return {
      code: 200,
      message: '删除客户成功',
      data: null,
      success: true
    };
  }
};

// 产品相关API
export const mockProductApi = {
  // 获取产品列表
  getProducts: async (params: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    await delay();
    
    let products = [...mockData.products];
    
    // 搜索
    if (params.keyword) {
      products = search(products, params, ['name', 'description', 'category']);
    }
    
    // 分页
    const result = paginate(products, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取产品列表成功',
      data: result,
      success: true
    };
  },

  // 获取产品详情
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    await delay();
    
    const product = mockData.products.find(p => p.id === id);
    if (!product) {
      return {
        code: 404,
        message: '产品不存在',
        data: null as any,
        success: false
      };
    }
    
    return {
      code: 200,
      message: '获取产品详情成功',
      data: product,
      success: true
    };
  }
};

// 仪表板相关API
export const mockDashboardApi = {
  // 获取仪表板统计数据
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay();
    
    return {
      code: 200,
      message: '获取统计数据成功',
      data: mockData.dashboardStats,
      success: true
    };
  }
};

// 通知相关API
export const mockNotificationApi = {
  // 获取通知列表
  getNotifications: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    await delay();
    
    const result = paginate(mockData.notifications, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取通知列表成功',
      data: result,
      success: true
    };
  },

  // 标记通知为已读
  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    
    const notification = mockData.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    
    return {
      code: 200,
      message: '标记通知为已读成功',
      data: null,
      success: true
    };
  }
};

// 美股证券相关API
export const mockStockApi = {
  // 获取股票列表
  getStocks: async (params: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<Stock>>> => {
    await delay();
    
    let stocks = [...mockData.stocks];
    
    // 搜索
    if (params.keyword) {
      stocks = search(stocks, params, ['symbol', 'name', 'sector', 'industry']);
    }
    
    // 分页
    const result = paginate(stocks, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取股票列表成功',
      data: result,
      success: true
    };
  },

  // 获取股票详情
  getStockBySymbol: async (symbol: string): Promise<ApiResponse<Stock>> => {
    await delay();
    
    const stock = mockData.stocks.find(s => s.symbol === symbol);
    if (!stock) {
      return {
        code: 404,
        message: '股票不存在',
        data: null as any,
        success: false
      };
    }
    
    return {
      code: 200,
      message: '获取股票详情成功',
      data: stock,
      success: true
    };
  },

  // 获取持仓列表
  getPositions: async (params: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<Position>>> => {
    await delay();
    
    let positions = [...mockData.positions];
    
    // 搜索
    if (params.keyword) {
      positions = search(positions, params, ['stockSymbol', 'stockName']);
    }
    
    // 分页
    const result = paginate(positions, params.page, params.pageSize);
    
    return {
      code: 200,
      message: '获取持仓列表成功',
      data: result,
      success: true
    };
  },

  // 获取投资组合概览
  getPortfolioOverview: async (): Promise<ApiResponse<PortfolioOverview>> => {
    await delay();
    
    return {
      code: 200,
      message: '获取投资组合概览成功',
      data: mockData.portfolioOverview,
      success: true
    };
  },

  // 获取股票指标
  getStockMetrics: async (symbol: string): Promise<ApiResponse<StockMetrics>> => {
    await delay();
    
    const metrics = mockData.stockMetrics.find(m => m.symbol === symbol);
    if (!metrics) {
      return {
        code: 404,
        message: '股票指标不存在',
        data: null as any,
        success: false
      };
    }
    
    return {
      code: 200,
      message: '获取股票指标成功',
      data: metrics,
      success: true
    };
  },

  // 获取相关股票推荐
  getRelatedStocks: async (symbol: string, count: number = 5): Promise<ApiResponse<RelatedStock[]>> => {
    await delay();
    
    const targetStock = mockData.stocks.find(s => s.symbol === symbol);
    if (!targetStock) {
      return {
        code: 404,
        message: '股票不存在',
        data: [],
        success: false
      };
    }
    
    // 生成相关股票推荐
    const relatedStocks = mockData.stocks
      .filter(stock => stock.symbol !== symbol)
      .filter(stock => stock.sector === targetStock.sector || stock.industry === targetStock.industry)
      .slice(0, count)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        industry: stock.industry,
        currentPrice: stock.currentPrice,
        dayChangePercent: stock.dayChangePercent,
        marketCap: stock.marketCap,
        correlation: Math.random() * 0.8 + 0.2,
        reason: `同属${stock.sector}行业，具有相似的市场表现`,
        logo: stock.logo
      }));
    
    return {
      code: 200,
      message: '获取相关股票推荐成功',
      data: relatedStocks,
      success: true
    };
  },

  // 获取股价历史数据
  getPriceHistory: async (symbol: string, days: number = 30): Promise<ApiResponse<PriceDataPoint[]>> => {
    await delay();
    
    // 动态生成股价历史数据
    const { generatePriceHistory } = await import('./mockData');
    const priceHistory = generatePriceHistory(symbol, days);
    
    return {
      code: 200,
      message: '获取股价历史数据成功',
      data: priceHistory,
      success: true
    };
  },

  // 获取交易记录
  getTradeRecords: async (symbol: string): Promise<ApiResponse<TradeRecord[]>> => {
    await delay();
    
    // 动态生成交易记录
    const { generateTradeRecords } = await import('./mockData');
    const tradeRecords = generateTradeRecords(symbol, 15);
    
    return {
      code: 200,
      message: '获取交易记录成功',
      data: tradeRecords,
      success: true
    };
  }
};

// 导出所有Mock API
export const mockApi = {
  users: mockUserApi,
  customers: mockCustomerApi,
  products: mockProductApi,
  dashboard: mockDashboardApi,
  notifications: mockNotificationApi,
  stocks: mockStockApi
};

// 重新生成Mock数据（用于测试）
export const regenerateMockData = () => {
  mockData = generateMockData();
  console.log('🔄 Mock数据已重新生成');
};
