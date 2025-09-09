// 数据模型和类型定义

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'user' | 'manager';
export type UserStatus = 'active' | 'inactive' | 'pending';

// 客户相关类型
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  location: string;
  registrationDate: string;
  lastContact: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
}

export type CustomerStatus = 'active' | 'inactive' | 'pending';

// 产品相关类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  stock: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

// 订单相关类型
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// 仪表板统计类型
export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

// 系统设置类型
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

// 通知类型
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// 日志类型
export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  timestamp: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 文件上传类型
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// 搜索和筛选类型
export interface SearchFilters {
  keyword?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// 美股证券相关类型
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  volume: number;
  avgVolume: number;
  pe: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  beta: number;
  high52Week: number;
  low52Week: number;
  description: string;
  website: string;
  logo?: string;
}

// 持仓信息
export interface Position {
  id: string;
  stockSymbol: string;
  stockName: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  realizedGainLoss: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  institutionalHoldingPercent: number; // 机构持仓占比
  purchaseDate: string;
  lastUpdated: string;
}

// 股票指标
export interface StockMetrics {
  symbol: string;
  technicalIndicators: {
    rsi: number; // 相对强弱指数
    macd: number; // MACD
    bollingerUpper: number; // 布林带上轨
    bollingerMiddle: number; // 布林带中轨
    bollingerLower: number; // 布林带下轨
    sma20: number; // 20日简单移动平均
    sma50: number; // 50日简单移动平均
    sma200: number; // 200日简单移动平均
  };
  fundamentalMetrics: {
    pe: number; // 市盈率
    peg: number; // PEG比率
    pb: number; // 市净率
    ps: number; // 市销率
    evEbitda: number; // EV/EBITDA
    roe: number; // 净资产收益率
    roa: number; // 总资产收益率
    debtToEquity: number; // 负债权益比
    currentRatio: number; // 流动比率
    quickRatio: number; // 速动比率
  };
  analystRatings: {
    buy: number;
    hold: number;
    sell: number;
    averageRating: number; // 1-5分
    priceTarget: number;
    priceTargetUpside: number; // 上涨空间百分比
  };
  lastUpdated: string;
}

// 相关股票推荐
export interface RelatedStock {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  currentPrice: number;
  dayChangePercent: number;
  marketCap: number;
  correlation: number; // 相关性系数
  reason: string; // 推荐理由
  logo?: string;
}

// 股价历史数据点
export interface PriceDataPoint {
  date: string;
  price: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// 交易记录
export interface TradeRecord {
  id: string;
  stockSymbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  totalAmount: number;
  date: string;
  fees: number;
  notes?: string;
}

// 投资组合概览
export interface PortfolioOverview {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayGainLoss: number;
  dayGainLossPercent: number;
  positions: Position[];
  topPerformers: Position[];
  worstPerformers: Position[];
  sectorAllocation: {
    sector: string;
    value: number;
    percentage: number;
  }[];
  lastUpdated: string;
}

// 所有类型都在此文件中定义，无需额外导出
