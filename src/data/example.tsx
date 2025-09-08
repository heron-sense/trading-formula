// 使用示例 - 展示如何在页面中使用新的数据架构
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { useCustomers, useCustomerOperations } from './hooks';

// 示例：客户列表页面使用新的数据架构
const CustomerListExample: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);

  // 使用自定义Hook获取客户数据
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
    page: currentPage,
    pageSize: currentPageSize,
    keyword: searchKeyword
  });

  // 使用操作Hook进行CRUD操作
  const {
    loading: operationLoading,
    error: operationError,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomerOperations();

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setSearchParams({ keyword });
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
  };

  // 处理创建客户
  const handleCreateCustomer = async () => {
    const newCustomer = {
      name: '新客户',
      email: 'new@example.com',
      phone: '138-0000-0000',
      company: '新公司',
      status: 'active' as const,
      location: '北京市'
    };

    const result = await createCustomer(newCustomer);
    if (result) {
      console.log('客户创建成功:', result);
      refetch(); // 刷新列表
    }
  };

  // 处理删除客户
  const handleDeleteCustomer = async (customerId: string) => {
    const success = await deleteCustomer(customerId);
    if (success) {
      console.log('客户删除成功');
      refetch(); // 刷新列表
    }
  };

  // 加载状态
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>加载中...</Typography>
      </Box>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        加载失败: {error}
      </Alert>
    );
  }

  // 操作错误
  if (operationError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        操作失败: {operationError}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 页面标题 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          客户管理示例
        </Typography>
        <Typography variant="body1" color="text.secondary">
          展示如何使用新的数据架构进行数据管理
        </Typography>
      </Paper>

      {/* 搜索和操作栏 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="搜索客户..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refetch}
            disabled={loading}
          >
            刷新
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCustomer}
            disabled={operationLoading}
          >
            新增客户
          </Button>
        </Box>

        {/* 分页信息 */}
        <Typography variant="body2" color="text.secondary">
          共 {pagination.total} 条记录，第 {currentPage} / {pagination.totalPages} 页
        </Typography>
      </Paper>

      {/* 客户列表 */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {customersData?.items.map((customer) => (
          <Box
            key={customer.id}
            sx={{
              p: 2,
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="h6">{customer.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.email} • {customer.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.company} • {customer.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleDeleteCustomer(customer.id)}
                disabled={operationLoading}
              >
                删除
              </Button>
            </Box>
          </Box>
        ))}

        {/* 分页控件 */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            每页显示:
            <Button
              size="small"
              onClick={() => handlePageSizeChange(5)}
              disabled={currentPageSize === 5}
            >
              5
            </Button>
            <Button
              size="small"
              onClick={() => handlePageSizeChange(10)}
              disabled={currentPageSize === 10}
            >
              10
            </Button>
            <Button
              size="small"
              onClick={() => handlePageSizeChange(20)}
              disabled={currentPageSize === 20}
            >
              20
            </Button>
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              上一页
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center', px: 2 }}>
              {currentPage} / {pagination.totalPages}
            </Typography>
            <Button
              size="small"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              下一页
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerListExample;
