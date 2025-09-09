// Mock数据生成器
import { 
  User, UserRole, UserStatus,
  Customer, CustomerStatus,
  Product, ProductStatus,
  Order, OrderItem, OrderStatus,
  DashboardStats,
  Notification, NotificationType,
  LogEntry, LogLevel,
  Stock, Position, StockMetrics, RelatedStock, PortfolioOverview,
  PriceDataPoint, TradeRecord
} from '../models';

// 工具函数
const randomId = (): string => Math.random().toString(36).substr(2, 9);
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// 中文姓名生成
const chineseNames = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八',
  '韩十九', '杨二十', '朱二一', '秦二二', '尤二三', '许二四', '何二五', '吕二六',
  '施二七', '张二八', '孔二九', '曹三十', '严三一', '华三二', '金三三', '魏三四'
];

const companies = [
  '阿里巴巴集团', '腾讯科技', '百度公司', '字节跳动', '美团', '滴滴出行',
  '京东集团', '小米科技', '华为技术', '网易公司', '新浪微博', '搜狐公司',
  '奇虎360', '携程旅行', '拼多多', '快手科技', '哔哩哔哩', '爱奇艺'
];

const cities = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市',
  '武汉市', '成都市', '西安市', '重庆市', '天津市', '苏州市'
];

const productCategories = [
  '电子产品', '服装鞋帽', '家居用品', '食品饮料', '图书音像', '运动户外',
  '美妆护肤', '母婴用品', '汽车用品', '办公用品'
];

// 生成用户数据
export const generateUsers = (count: number = 50): User[] => {
  const roles: UserRole[] = ['admin', 'user', 'manager'];
  const statuses: UserStatus[] = ['active', 'inactive', 'pending'];
  
  return Array.from({ length: count }, (_, index) => {
    const name = randomChoice(chineseNames);
    const role = randomChoice(roles);
    const status = randomChoice(statuses);
    const createdAt = randomDate(new Date(2023, 0, 1), new Date());
    
    return {
      id: `user_${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role,
      status,
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: status === 'active' ? randomDate(new Date(2024, 11, 1), new Date()) : undefined
    };
  });
};

// 生成客户数据
export const generateCustomers = (count: number = 100): Customer[] => {
  const statuses: CustomerStatus[] = ['active', 'inactive', 'pending'];
  const tags = ['VIP', '新客户', '老客户', '重要客户', '潜在客户'];
  
  return Array.from({ length: count }, (_, index) => {
    const name = randomChoice(chineseNames);
    const company = randomChoice(companies);
    const city = randomChoice(cities);
    const status = randomChoice(statuses);
    const registrationDate = randomDate(new Date(2023, 0, 1), new Date());
    const lastContact = randomDate(new Date(2024, 11, 1), new Date());
    
    return {
      id: `customer_${index + 1}`,
      name,
      email: `${name.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `138-${String(randomInt(1000, 9999))}-${String(randomInt(1000, 9999))}`,
      company,
      status,
      location: city,
      registrationDate,
      lastContact,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      notes: status === 'active' ? '活跃客户，经常购买' : '需要跟进',
      tags: [randomChoice(tags)]
    };
  });
};

// 生成产品数据
export const generateProducts = (count: number = 200): Product[] => {
  const statuses: ProductStatus[] = ['active', 'inactive', 'discontinued'];
  const productNames = [
    '智能手机', '笔记本电脑', '平板电脑', '智能手表', '无线耳机',
    '运动鞋', '休闲T恤', '牛仔裤', '羽绒服', '连衣裙',
    '咖啡机', '空气净化器', '扫地机器人', '智能音箱', '电动牙刷',
    '有机大米', '进口红酒', '坚果礼盒', '茶叶套装', '蜂蜜'
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const name = randomChoice(productNames);
    const category = randomChoice(productCategories);
    const status = randomChoice(statuses);
    const price = randomInt(10, 9999);
    const stock = randomInt(0, 1000);
    const createdAt = randomDate(new Date(2023, 0, 1), new Date());
    
    return {
      id: `product_${index + 1}`,
      name: `${name} ${index + 1}`,
      description: `高品质的${name}，适合日常使用`,
      price,
      category,
      status,
      stock,
      images: [
        `https://picsum.photos/300/300?random=${index + 1}`,
        `https://picsum.photos/300/300?random=${index + 1000}`
      ],
      createdAt,
      updatedAt: createdAt
    };
  });
};

// 生成订单数据
export const generateOrders = (count: number = 500, customers: Customer[], products: Product[]): Order[] => {
  const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  
  return Array.from({ length: count }, (_, index) => {
    const customer = randomChoice(customers);
    const status = randomChoice(statuses);
    const orderDate = randomDate(new Date(2024, 0, 1), new Date());
    
    // 生成订单项
    const itemCount = randomInt(1, 5);
    const items: OrderItem[] = Array.from({ length: itemCount }, () => {
      const product = randomChoice(products);
      const quantity = randomInt(1, 10);
      const price = product.price;
      const total = price * quantity;
      
      return {
        productId: product.id,
        productName: product.name,
        quantity,
        price,
        total
      };
    });
    
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    
    return {
      id: `order_${index + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      items,
      totalAmount,
      status,
      orderDate,
      deliveryDate: status === 'delivered' ? randomDate(new Date(orderDate), new Date()) : undefined,
      notes: status === 'cancelled' ? '客户取消订单' : undefined
    };
  });
};

// 生成仪表板统计数据
export const generateDashboardStats = (users: User[], customers: Customer[], products: Product[], orders: Order[]): DashboardStats => {
  const totalUsers = users.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  
  const revenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  
  const userGrowth = randomInt(5, 25);
  const orderGrowth = randomInt(10, 30);
  const revenueGrowth = randomInt(8, 35);
  
  return {
    totalUsers,
    totalCustomers,
    totalProducts,
    totalOrders,
    revenue,
    userGrowth,
    orderGrowth,
    revenueGrowth
  };
};

// 生成通知数据
export const generateNotifications = (count: number = 20): Notification[] => {
  const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
  const titles = [
    '新用户注册', '订单已发货', '库存不足提醒', '系统维护通知',
    '支付成功', '密码重置', '数据备份完成', '新消息提醒'
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const type = randomChoice(types);
    const title = randomChoice(titles);
    const createdAt = randomDate(new Date(2024, 11, 1), new Date());
    
    return {
      id: `notification_${index + 1}`,
      title,
      message: `${title}的详细信息...`,
      type,
      read: Math.random() > 0.5,
      createdAt,
      actionUrl: Math.random() > 0.7 ? '/dashboard' : undefined
    };
  });
};

// 生成日志数据
export const generateLogs = (count: number = 100): LogEntry[] => {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const messages = [
    '用户登录成功', 'API请求处理', '数据库查询', '文件上传完成',
    '权限验证失败', '系统错误', '缓存更新', '定时任务执行'
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const level = randomChoice(levels);
    const message = randomChoice(messages);
    const timestamp = randomDate(new Date(2024, 11, 1), new Date());
    
    return {
      id: `log_${index + 1}`,
      level,
      message,
      context: { userId: `user_${randomInt(1, 50)}`, action: message },
      userId: `user_${randomInt(1, 50)}`,
      timestamp
    };
  });
};

// 美股证券相关数据生成
const stockSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'E-commerce' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Social Media' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials', industry: 'Insurance' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Banking' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Pharmaceuticals' }
];

const exchanges = ['NASDAQ', 'NYSE', 'AMEX'];
const sectors = ['Technology', 'Healthcare', 'Financials', 'Consumer Discretionary', 'Industrials', 'Energy', 'Materials', 'Utilities', 'Real Estate', 'Communication Services'];

// 生成股票数据
export const generateStocks = (count: number = 50): Stock[] => {
  return Array.from({ length: count }, (_, index) => {
    const stockInfo = stockSymbols[index % stockSymbols.length];
    const currentPrice = randomInt(10, 500);
    const previousClose = currentPrice + randomInt(-20, 20);
    const dayChange = currentPrice - previousClose;
    const dayChangePercent = (dayChange / previousClose) * 100;
    
    return {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      exchange: randomChoice(exchanges),
      sector: stockInfo.sector,
      industry: stockInfo.industry,
      marketCap: randomInt(1000000000, 3000000000000), // 10亿到3万亿
      currentPrice,
      previousClose,
      dayChange,
      dayChangePercent,
      volume: randomInt(1000000, 100000000),
      avgVolume: randomInt(5000000, 50000000),
      pe: randomInt(10, 50),
      eps: randomInt(1, 20),
      dividend: randomInt(0, 5),
      dividendYield: Math.random() * 5,
      beta: Math.random() * 2 + 0.5,
      high52Week: currentPrice + randomInt(10, 100),
      low52Week: currentPrice - randomInt(10, 100),
      description: `${stockInfo.name}是一家领先的${stockInfo.industry}公司`,
      website: `https://www.${stockInfo.symbol.toLowerCase()}.com`,
      logo: `https://logo.clearbit.com/${stockInfo.symbol.toLowerCase()}.com`
    };
  });
};

// 生成持仓数据
export const generatePositions = (stocks: Stock[], count: number = 20): Position[] => {
  return Array.from({ length: count }, (_, index) => {
    const stock = randomChoice(stocks);
    const shares = randomInt(10, 1000);
    const averagePrice = stock.currentPrice * (0.8 + Math.random() * 0.4); // 平均价格在现价的80%-120%之间
    const currentPrice = stock.currentPrice;
    const marketValue = shares * currentPrice;
    const costBasis = shares * averagePrice;
    const unrealizedGainLoss = marketValue - costBasis;
    const unrealizedGainLossPercent = (unrealizedGainLoss / costBasis) * 100;
    const realizedGainLoss = randomInt(-1000, 2000);
    const totalGainLoss = unrealizedGainLoss + realizedGainLoss;
    const totalGainLossPercent = (totalGainLoss / costBasis) * 100;
    const institutionalHoldingPercent = Math.random() * 100; // 机构持仓占比 0-100%
    const purchaseDate = randomDate(new Date(2023, 0, 1), new Date());
    
    return {
      id: `position_${index + 1}`,
      stockSymbol: stock.symbol,
      stockName: stock.name,
      shares,
      averagePrice,
      currentPrice,
      marketValue,
      costBasis,
      unrealizedGainLoss,
      unrealizedGainLossPercent,
      realizedGainLoss,
      totalGainLoss,
      totalGainLossPercent,
      institutionalHoldingPercent,
      purchaseDate,
      lastUpdated: new Date().toISOString()
    };
  });
};

// 生成股票指标数据
export const generateStockMetrics = (stocks: Stock[]): StockMetrics[] => {
  return stocks.map(stock => ({
    symbol: stock.symbol,
    technicalIndicators: {
      rsi: randomInt(20, 80),
      macd: randomInt(-5, 5),
      bollingerUpper: stock.currentPrice * 1.1,
      bollingerMiddle: stock.currentPrice,
      bollingerLower: stock.currentPrice * 0.9,
      sma20: stock.currentPrice * (0.95 + Math.random() * 0.1),
      sma50: stock.currentPrice * (0.9 + Math.random() * 0.2),
      sma200: stock.currentPrice * (0.8 + Math.random() * 0.4)
    },
    fundamentalMetrics: {
      pe: randomInt(10, 50),
      peg: Math.random() * 3,
      pb: Math.random() * 5,
      ps: Math.random() * 10,
      evEbitda: randomInt(5, 30),
      roe: randomInt(5, 25),
      roa: randomInt(2, 15),
      debtToEquity: Math.random() * 2,
      currentRatio: Math.random() * 3 + 1,
      quickRatio: Math.random() * 2 + 0.5
    },
    analystRatings: {
      buy: randomInt(5, 15),
      hold: randomInt(3, 10),
      sell: randomInt(1, 5),
      averageRating: 3 + Math.random() * 2,
      priceTarget: stock.currentPrice * (0.8 + Math.random() * 0.4),
      priceTargetUpside: (Math.random() - 0.5) * 50
    },
    lastUpdated: new Date().toISOString()
  }));
};

// 生成相关股票推荐
export const generateRelatedStocks = (stocks: Stock[], targetStock: Stock, count: number = 5): RelatedStock[] => {
  const relatedStocks = stocks
    .filter(stock => stock.symbol !== targetStock.symbol)
    .filter(stock => stock.sector === targetStock.sector || stock.industry === targetStock.industry)
    .slice(0, count);
  
  return relatedStocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    industry: stock.industry,
    currentPrice: stock.currentPrice,
    dayChangePercent: stock.dayChangePercent,
    marketCap: stock.marketCap,
    correlation: Math.random() * 0.8 + 0.2, // 0.2-1.0的相关性
    reason: `同属${stock.sector}行业，具有相似的市场表现`,
    logo: stock.logo
  }));
};

// 生成投资组合概览
export const generatePortfolioOverview = (positions: Position[]): PortfolioOverview => {
  const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  const totalCost = positions.reduce((sum, pos) => sum + pos.costBasis, 0);
  const totalGainLoss = positions.reduce((sum, pos) => sum + pos.totalGainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;
  const dayGainLoss = positions.reduce((sum, pos) => sum + (pos.currentPrice - pos.averagePrice) * pos.shares * 0.01, 0);
  const dayGainLossPercent = (dayGainLoss / totalValue) * 100;
  
  // 按表现排序
  const sortedPositions = [...positions].sort((a, b) => b.totalGainLossPercent - a.totalGainLossPercent);
  const topPerformers = sortedPositions.slice(0, 3);
  const worstPerformers = sortedPositions.slice(-3);
  
  // 行业分配
  const sectorMap = new Map<string, number>();
  positions.forEach(pos => {
    const sector = pos.stockName; // 简化处理，实际应该从股票信息获取
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + pos.marketValue);
  });
  
  const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    value,
    percentage: (value / totalValue) * 100
  }));
  
  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dayGainLoss,
    dayGainLossPercent,
    positions,
    topPerformers,
    worstPerformers,
    sectorAllocation,
    lastUpdated: new Date().toISOString()
  };
};

// 生成股价历史数据
export const generatePriceHistory = (symbol: string, days: number = 30): PriceDataPoint[] => {
  const priceHistory: PriceDataPoint[] = [];
  const basePrice = randomInt(50, 300);
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 模拟价格波动
    const change = (Math.random() - 0.5) * 0.1; // ±5%的日波动
    currentPrice = currentPrice * (1 + change);
    
    const open = currentPrice * (0.98 + Math.random() * 0.04);
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (0.98 + Math.random() * 0.02);
    const volume = randomInt(1000000, 10000000);
    
    priceHistory.push({
      date: date.toISOString().split('T')[0],
      price: close,
      volume,
      open,
      high,
      low,
      close
    });
  }
  
  return priceHistory;
};

// 生成交易记录
export const generateTradeRecords = (symbol: string, count: number = 10): TradeRecord[] => {
  const tradeRecords: TradeRecord[] = [];
  const basePrice = randomInt(50, 300);
  
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.6 ? 'buy' : 'sell';
    const shares = randomInt(10, 500);
    const price = basePrice * (0.9 + Math.random() * 0.2);
    const totalAmount = shares * price;
    const fees = totalAmount * 0.001; // 0.1%的手续费
    const date = randomDate(new Date(2023, 0, 1), new Date());
    
    tradeRecords.push({
      id: `trade_${symbol}_${i + 1}`,
      stockSymbol: symbol,
      type,
      shares,
      price,
      totalAmount,
      date,
      fees,
      notes: type === 'buy' ? '定期投资' : '获利了结'
    });
  }
  
  // 按日期排序
  return tradeRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 生成所有Mock数据
export const generateMockData = () => {
  console.log('🎭 生成Mock数据...');
  
  const users = generateUsers(50);
  const customers = generateCustomers(100);
  const products = generateProducts(200);
  const orders = generateOrders(500, customers, products);
  const dashboardStats = generateDashboardStats(users, customers, products, orders);
  const notifications = generateNotifications(20);
  const logs = generateLogs(100);
  
  // 美股证券数据
  const stocks = generateStocks(50);
  const positions = generatePositions(stocks, 20);
  const stockMetrics = generateStockMetrics(stocks);
  const portfolioOverview = generatePortfolioOverview(positions);
  
  const mockData = {
    users,
    customers,
    products,
    orders,
    dashboardStats,
    notifications,
    logs,
    stocks,
    positions,
    stockMetrics,
    portfolioOverview
  };
  
  console.log('✅ Mock数据生成完成:', {
    users: users.length,
    customers: customers.length,
    products: products.length,
    orders: orders.length,
    notifications: notifications.length,
    logs: logs.length,
    stocks: stocks.length,
    positions: positions.length,
    stockMetrics: stockMetrics.length
  });
  
  return mockData;
};
