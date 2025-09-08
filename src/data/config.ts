// Mock配置和开关
export const MOCK_CONFIG = {
  // 是否启用Mock模式
  ENABLE_MOCK: process.env.REACT_APP_USE_MOCK === 'true' || process.env.NODE_ENV === 'development',
  
  // Mock数据配置
  MOCK_DATA: {
    // 用户数量
    USER_COUNT: 50,
    // 客户数量
    CUSTOMER_COUNT: 100,
    // 产品数量
    PRODUCT_COUNT: 200,
    // 订单数量
    ORDER_COUNT: 500,
    // 通知数量
    NOTIFICATION_COUNT: 20,
    // 日志数量
    LOG_COUNT: 100
  },
  
  // API延迟配置（毫秒）
  API_DELAY: {
    // 默认延迟
    DEFAULT: 500,
    // 快速响应（用于测试）
    FAST: 100,
    // 慢速响应（用于测试加载状态）
    SLOW: 2000
  },
  
  // 错误模拟配置
  ERROR_SIMULATION: {
    // 是否启用错误模拟
    ENABLED: false,
    // 错误概率（0-1）
    ERROR_RATE: 0.1,
    // 错误类型
    ERROR_TYPES: ['network', 'server', 'timeout', 'auth']
  }
};

// 获取API延迟时间
export const getApiDelay = (type: keyof typeof MOCK_CONFIG.API_DELAY = 'DEFAULT'): number => {
  return MOCK_CONFIG.API_DELAY[type];
};

// 检查是否应该模拟错误
export const shouldSimulateError = (): boolean => {
  if (!MOCK_CONFIG.ERROR_SIMULATION.ENABLED) return false;
  return Math.random() < MOCK_CONFIG.ERROR_SIMULATION.ERROR_RATE;
};

// 获取随机错误类型
export const getRandomErrorType = (): string => {
  const types = MOCK_CONFIG.ERROR_SIMULATION.ERROR_TYPES;
  return types[Math.floor(Math.random() * types.length)];
};

// 环境变量配置
export const ENV_CONFIG = {
  // API基础URL
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  
  // 是否启用调试模式
  DEBUG: process.env.NODE_ENV === 'development',
  
  // 是否启用Mock模式
  USE_MOCK: process.env.REACT_APP_USE_MOCK === 'true',
  
  // 应用版本
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // 应用名称
  APP_NAME: process.env.REACT_APP_NAME || 'HTF Frontend'
};

// 开发环境配置
export const DEV_CONFIG = {
  // 是否显示Mock数据信息
  SHOW_MOCK_INFO: true,
  
  // 是否启用API日志
  ENABLE_API_LOGS: true,
  
  // 是否启用性能监控
  ENABLE_PERFORMANCE_MONITOR: true
};

// 生产环境配置
export const PROD_CONFIG = {
  // 是否显示Mock数据信息
  SHOW_MOCK_INFO: false,
  
  // 是否启用API日志
  ENABLE_API_LOGS: false,
  
  // 是否启用性能监控
  ENABLE_PERFORMANCE_MONITOR: false
};

// 根据环境获取配置
export const getConfig = () => {
  return process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG;
};

// 导出默认配置
export default {
  MOCK_CONFIG,
  ENV_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG,
  getConfig,
  getApiDelay,
  shouldSimulateError,
  getRandomErrorType
};
