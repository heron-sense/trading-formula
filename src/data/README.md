# 数据层架构说明

这个目录包含了统一的数据管理架构，支持Mock数据和真实API调用。

## 📁 目录结构

```
src/data/
├── index.ts          # 统一导出
├── config.ts         # 配置和开关
├── mockData.ts       # Mock数据生成器
├── mockApi.ts        # Mock API服务
├── hooks.ts          # 自定义Hooks
├── example.tsx       # 使用示例
└── README.md         # 说明文档
```

## 🚀 快速开始

### 1. 基本使用

```tsx
import { useCustomers, useCustomerOperations } from '../data';

const CustomerList = () => {
  // 获取客户数据
  const {
    data: customersData,
    loading,
    error,
    pagination,
    setPage,
    setPageSize,
    setSearchParams,
    refetch
  } = useCustomers({
    page: 1,
    pageSize: 10,
    keyword: '搜索关键词'
  });

  // 操作Hook
  const {
    loading: operationLoading,
    error: operationError,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomerOperations();

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchParams({ keyword });
    setPage(1);
  };

  // 处理创建
  const handleCreate = async () => {
    const result = await createCustomer({
      name: '新客户',
      email: 'new@example.com',
      // ... 其他字段
    });
    
    if (result) {
      refetch(); // 刷新列表
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {customersData?.items.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
};
```

### 2. 可用的Hooks

#### 数据获取Hooks
- `useUsers(params)` - 获取用户列表
- `useUser(id)` - 获取单个用户
- `useCustomers(params)` - 获取客户列表
- `useCustomer(id)` - 获取单个客户
- `useProducts(params)` - 获取产品列表
- `useProduct(id)` - 获取单个产品
- `useDashboardStats()` - 获取仪表板统计
- `useNotifications(params)` - 获取通知列表

#### 操作Hooks
- `useUserOperations()` - 用户CRUD操作
- `useCustomerOperations()` - 客户CRUD操作

### 3. 配置

#### 环境变量
```bash
# .env
REACT_APP_USE_MOCK=true          # 是否使用Mock数据
REACT_APP_API_BASE_URL=http://localhost:8080/api  # API基础URL
```

#### Mock配置
```typescript
import { MOCK_CONFIG } from '../data';

// 修改Mock数据数量
MOCK_CONFIG.MOCK_DATA.USER_COUNT = 100;

// 修改API延迟
MOCK_CONFIG.API_DELAY.DEFAULT = 1000;
```

## 🔧 架构特点

### 1. 统一的数据管理
- 所有API调用都通过统一的Hooks进行
- 自动处理加载状态、错误状态
- 支持分页、搜索、排序

### 2. Mock数据支持
- 自动生成真实的测试数据
- 支持网络延迟模拟
- 可以模拟各种错误情况

### 3. 类型安全
- 完整的TypeScript类型定义
- 编译时类型检查
- 智能代码提示

### 4. 错误处理
- 统一的错误处理机制
- 自动重试机制
- 用户友好的错误提示

## 📊 数据模型

### 用户 (User)
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

### 客户 (Customer)
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  location: string;
  registrationDate: string;
  lastContact: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
}
```

### 产品 (Product)
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'inactive' | 'discontinued';
  stock: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

## 🎯 最佳实践

### 1. 使用Hook进行数据管理
```tsx
// ✅ 推荐
const { data, loading, error } = useCustomers();

// ❌ 不推荐
const [customers, setCustomers] = useState([]);
useEffect(() => {
  fetchCustomers().then(setCustomers);
}, []);
```

### 2. 处理加载和错误状态
```tsx
const CustomerList = () => {
  const { data, loading, error } = useCustomers();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <CustomerTable data={data} />;
};
```

### 3. 使用操作Hook进行CRUD
```tsx
const CustomerForm = () => {
  const { createCustomer, loading } = useCustomerOperations();
  
  const handleSubmit = async (formData) => {
    const result = await createCustomer(formData);
    if (result) {
      // 成功处理
      navigate('/customers');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

## 🔄 从Mock切换到真实API

1. 修改环境变量：
```bash
REACT_APP_USE_MOCK=false
REACT_APP_API_BASE_URL=https://your-api.com/api
```

2. 实现真实的API服务：
```typescript
// 替换mockApi中的实现
export const realApi = {
  users: {
    getUsers: (params) => ApiService.get('/users', { params }),
    // ... 其他方法
  }
};
```

3. 更新Hooks中的API调用：
```typescript
// 根据配置选择API
const api = MOCK_CONFIG.ENABLE_MOCK ? mockApi : realApi;
```

## 🐛 调试

### 启用调试日志
```typescript
import { DEV_CONFIG } from '../data';

if (DEV_CONFIG.ENABLE_API_LOGS) {
  console.log('API调用:', request);
}
```

### 查看Mock数据
```typescript
import { generateMockData } from '../data';

const mockData = generateMockData();
console.log('Mock数据:', mockData);
```

## 📝 注意事项

1. **性能优化**: 使用`useCallback`和`useMemo`优化Hook性能
2. **错误边界**: 在组件树中添加错误边界处理未捕获的错误
3. **缓存策略**: 考虑实现数据缓存以减少API调用
4. **离线支持**: 可以扩展支持离线数据存储

## 🤝 贡献

如果需要添加新的数据模型或API：

1. 在`models/index.ts`中定义类型
2. 在`mockData.ts`中添加数据生成器
3. 在`mockApi.ts`中实现Mock API
4. 在`hooks.ts`中添加自定义Hook
5. 更新文档和示例
