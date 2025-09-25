import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Link as LinkIcon,
  Refresh,
  Star,
  StarBorder,
  Visibility,
  Close,
  ShowChart,
  History,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore
} from '@mui/icons-material';
import { usePortfolioOverview, usePriceHistory, useTradeRecords } from '../../data/hooks';

const StockAnalysisPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    minShares: '',
    maxShares: '',
    minPrice: '',
    maxPrice: '',
    minGainLoss: '',
    maxGainLoss: '',
    minInstitutionalHolding: '',
    maxInstitutionalHolding: '',
    sortBy: 'stockSymbol',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });

  // 查询状态
  const [queryTrigger, setQueryTrigger] = useState(0);
  
  // 获取投资组合概览
  const {
    data: portfolioData,
    loading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio
  } = usePortfolioOverview();

  // 获取股价历史数据
  const {
    data: priceHistoryData,
    loading: priceHistoryLoading,
    error: priceHistoryError
  } = usePriceHistory(selectedPosition?.stockSymbol || '', 30);

  // 获取交易记录
  const {
    data: tradeRecordsData,
    loading: tradeRecordsLoading,
    error: tradeRecordsError
  } = useTradeRecords(selectedPosition?.stockSymbol || '');

  // 格式化货币
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // 格式化百分比
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // 获取涨跌颜色
  const getChangeColor = (value: number): string => {
    return value >= 0 ? '#4caf50' : '#f44336';
  };

  // 获取涨跌图标
  const getChangeIcon = (value: number) => {
    return value >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <UnfoldMore sx={{ fontSize: 16, opacity: 0.5 }} />;
    }
    return filters.sortOrder === 'asc' 
      ? <ArrowUpward sx={{ fontSize: 16 }} /> 
      : <ArrowDownward sx={{ fontSize: 16 }} />;
  };

  // 处理查看详情
  const handleViewDetails = (position: any) => {
    setSelectedPosition(position);
    setDialogOpen(true);
    setActiveTab(0);
  };

  // 关闭弹窗
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPosition(null);
  };

  // 处理标签页切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 处理筛选器变化
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // 筛选条件变化时重置到第一页
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // 处理排序
  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 处理分页变化
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };

  // 处理每页条数变化
  const handlePageSizeChange = (event: any) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(event.target.value),
      page: 1 // 重置到第一页
    }));
  };

  // 处理查询
  const handleQuery = () => {
    // 触发数据重新获取
    setQueryTrigger(prev => prev + 1);
    // 重置到第一页
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    // 重新获取投资组合数据
    refetchPortfolio();
  };

  // 筛选和排序数据
  const getFilteredAndSortedPositions = () => {
    if (!portfolioData?.positions) return { data: [], total: 0 };
    
    let filtered = portfolioData.positions.filter(position => {
      // 搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!position.stockSymbol.toLowerCase().includes(searchLower) &&
            !position.stockName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // 持仓数量筛选
      if (filters.minShares && position.shares < parseInt(filters.minShares)) return false;
      if (filters.maxShares && position.shares > parseInt(filters.maxShares)) return false;
      
      // 价格筛选
      if (filters.minPrice && position.currentPrice < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && position.currentPrice > parseFloat(filters.maxPrice)) return false;
      
      // 盈亏筛选
      if (filters.minGainLoss && position.totalGainLoss < parseFloat(filters.minGainLoss)) return false;
      if (filters.maxGainLoss && position.totalGainLoss > parseFloat(filters.maxGainLoss)) return false;
      
      // 机构持仓占比筛选
      if (filters.minInstitutionalHolding && position.institutionalHoldingPercent < parseFloat(filters.minInstitutionalHolding)) return false;
      if (filters.maxInstitutionalHolding && position.institutionalHoldingPercent > parseFloat(filters.maxInstitutionalHolding)) return false;
      
      return true;
    });
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof typeof a];
      let bValue: any = b[filters.sortBy as keyof typeof b];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    const total = filtered.length;
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    return { data: paginatedData, total };
  };

  if (portfolioLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>加载中...</Typography>
      </Box>
    );
  }

  if (portfolioError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        加载失败: {portfolioError}
      </Alert>
    );
  }

  return (
    <Box>

      {/* 投资组合概览 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney sx={{ mr: 1 }} />
              投资组合总览
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {formatCurrency(portfolioData?.totalValue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getChangeIcon(portfolioData?.totalGainLoss || 0)}
                <Typography
                  variant="h6"
                  sx={{
                    color: getChangeColor(portfolioData?.totalGainLoss || 0),
                    ml: 1
                  }}
                >
                  {formatCurrency(portfolioData?.totalGainLoss || 0)} ({formatPercent(portfolioData?.totalGainLossPercent || 0)})
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                今日收益: {formatCurrency(portfolioData?.dayGainLoss || 0)} ({formatPercent(portfolioData?.dayGainLossPercent || 0)})
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assessment sx={{ mr: 1 }} />
              持仓统计
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {portfolioData?.positions.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                持仓股票数量
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  成本基础: {formatCurrency(portfolioData?.totalCost || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  市场价值: {formatCurrency(portfolioData?.totalValue || 0)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 筛选区域 */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            筛选和排序
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)', 
              lg: 'repeat(6, 1fr)' 
            }, 
            gap: 2 
          }}>
            {/* 搜索 */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / 3', md: '1 / 3', lg: '1 / 3' } }}>
              <TextField
                fullWidth
                label="搜索股票"
                placeholder="股票代码或名称"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Box>
            
            {/* 持仓数量范围 */}
            <Box>
              <TextField
                fullWidth
                label="最小持仓"
                placeholder="股数"
                value={filters.minShares}
                onChange={(e) => handleFilterChange('minShares', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="最大持仓"
                placeholder="股数"
                value={filters.maxShares}
                onChange={(e) => handleFilterChange('maxShares', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            
            {/* 价格范围 */}
            <Box>
              <TextField
                fullWidth
                label="最低价格"
                placeholder="$"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="最高价格"
                placeholder="$"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            
            {/* 盈亏范围 */}
            <Box>
              <TextField
                fullWidth
                label="最小盈亏"
                placeholder="$"
                value={filters.minGainLoss}
                onChange={(e) => handleFilterChange('minGainLoss', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="最大盈亏"
                placeholder="$"
                value={filters.maxGainLoss}
                onChange={(e) => handleFilterChange('maxGainLoss', e.target.value)}
                size="small"
                type="number"
              />
            </Box>
            
            {/* 机构持仓占比范围 */}
            <Box>
              <TextField
                fullWidth
                label="最小机构持仓占比"
                placeholder="%"
                value={filters.minInstitutionalHolding}
                onChange={(e) => handleFilterChange('minInstitutionalHolding', e.target.value)}
                size="small"
                type="number"
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="最大机构持仓占比"
                placeholder="%"
                value={filters.maxInstitutionalHolding}
                onChange={(e) => handleFilterChange('maxInstitutionalHolding', e.target.value)}
                size="small"
                type="number"
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'end',
              gridColumn: { xs: '1', sm: '1 / 3', md: '1 / 3', lg: '1 / 3' }
            }}>
              <Button
                variant="contained"
                onClick={handleQuery}
                disabled={portfolioLoading}
                sx={{
                  height: 40,
                  minWidth: 100,
                  fontWeight: 500
                }}
              >
                查询
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 持仓收益展示 */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            持仓收益详情
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('stockSymbol')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>股票</span>
                      {getSortIcon('stockSymbol')}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('shares')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <span>持仓数量</span>
                      {getSortIcon('shares')}
                    </Box>
                  </TableCell>
                  <TableCell align="right">平均成本</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('currentPrice')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <span>当前价格</span>
                      {getSortIcon('currentPrice')}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('marketValue')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <span>市场价值</span>
                      {getSortIcon('marketValue')}
                    </Box>
                  </TableCell>
                  <TableCell align="right">未实现盈亏</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('totalGainLoss')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <span>总盈亏</span>
                      {getSortIcon('totalGainLoss')}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSort('institutionalHoldingPercent')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <span>机构持仓占比</span>
                      {getSortIcon('institutionalHoldingPercent')}
                    </Box>
                  </TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredAndSortedPositions().data.map((position) => (
                  <TableRow key={position.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                          {position.stockSymbol.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {position.stockSymbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {position.stockName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{position.shares}</TableCell>
                    <TableCell align="right">{formatCurrency(position.averagePrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(position.currentPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(position.marketValue)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {getChangeIcon(position.unrealizedGainLoss)}
                        <Typography
                          variant="body2"
                          sx={{
                            color: getChangeColor(position.unrealizedGainLoss),
                            ml: 0.5
                          }}
                        >
                          {formatCurrency(position.unrealizedGainLoss)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {getChangeIcon(position.totalGainLoss)}
                        <Typography
                          variant="body2"
                          sx={{
                            color: getChangeColor(position.totalGainLoss),
                            ml: 0.5
                          }}
                        >
                          {formatCurrency(position.totalGainLoss)} ({formatPercent(position.totalGainLossPercent)})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: position.institutionalHoldingPercent > 50 ? 'success.main' : 
                                 position.institutionalHoldingPercent > 20 ? 'warning.main' : 'text.secondary'
                        }}
                      >
                        {formatPercent(position.institutionalHoldingPercent)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="查看详情">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(position)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 分页组件 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              共 {getFilteredAndSortedPositions().total} 条记录，第 {pagination.page} 页，共 {Math.ceil(getFilteredAndSortedPositions().total / pagination.pageSize)} 页
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                每页显示：
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  variant="outlined"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={Math.ceil(getFilteredAndSortedPositions().total / pagination.pageSize)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size="small"
              />
            </Stack>
          </Box>
        </Box>
      </Paper>


      {/* 资产详情弹窗 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="div">
              {selectedPosition?.stockSymbol} - {selectedPosition?.stockName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              资产详情分析
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab icon={<ShowChart />} label="股价曲线" />
              <Tab icon={<History />} label="交易记录" />
            </Tabs>
          </Box>

          {/* 股价曲线标签页 */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                股价历史走势 (最近30天)
              </Typography>
              {priceHistoryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : priceHistoryError ? (
                <Alert severity="error">加载股价数据失败: {priceHistoryError}</Alert>
              ) : priceHistoryData ? (
                <Box>
                  {/* 简化的股价图表 */}
                  <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      价格区间: {formatCurrency(Math.min(...priceHistoryData.map(d => d.low)))} - {formatCurrency(Math.max(...priceHistoryData.map(d => d.high)))}
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 0.5, overflow: 'auto' }}>
                      {priceHistoryData.map((point, index) => {
                        const maxPrice = Math.max(...priceHistoryData.map(d => d.high));
                        const minPrice = Math.min(...priceHistoryData.map(d => d.low));
                        const height = ((point.close - minPrice) / (maxPrice - minPrice)) * 100;
                        const isUp = point.close >= point.open;
                        
                        return (
                          <Tooltip
                            key={index}
                            title={
                              <Box>
                                <Typography variant="caption">
                                  {point.date}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                  开盘: {formatCurrency(point.open)}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                  收盘: {formatCurrency(point.close)}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                  最高: {formatCurrency(point.high)}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                  最低: {formatCurrency(point.low)}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                  成交量: {point.volume.toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: `${height}%`,
                                backgroundColor: isUp ? '#4caf50' : '#f44336',
                                borderRadius: 1,
                                minHeight: 2
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Paper>
                  
                  {/* 关键价格点 */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 2
                  }}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">当前价格</Typography>
                        <Typography variant="h6">{formatCurrency(priceHistoryData[priceHistoryData.length - 1]?.close || 0)}</Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">30日最高</Typography>
                        <Typography variant="h6">{formatCurrency(Math.max(...priceHistoryData.map(d => d.high)))}</Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">30日最低</Typography>
                        <Typography variant="h6">{formatCurrency(Math.min(...priceHistoryData.map(d => d.low)))}</Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">平均成交量</Typography>
                        <Typography variant="h6">
                          {Math.round(priceHistoryData.reduce((sum, d) => sum + d.volume, 0) / priceHistoryData.length).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              ) : null}
            </Box>
          )}

          {/* 交易记录标签页 */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                交易记录
              </Typography>
              {tradeRecordsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : tradeRecordsError ? (
                <Alert severity="error">加载交易记录失败: {tradeRecordsError}</Alert>
              ) : tradeRecordsData ? (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>日期</TableCell>
                        <TableCell>类型</TableCell>
                        <TableCell align="right">股数</TableCell>
                        <TableCell align="right">价格</TableCell>
                        <TableCell align="right">总金额</TableCell>
                        <TableCell align="right">手续费</TableCell>
                        <TableCell>备注</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tradeRecordsData.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>
                            {new Date(trade.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={trade.type === 'buy' ? '买入' : '卖出'}
                              color={trade.type === 'buy' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{trade.shares}</TableCell>
                          <TableCell align="right">{formatCurrency(trade.price)}</TableCell>
                          <TableCell align="right">{formatCurrency(trade.totalAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(trade.fees)}</TableCell>
                          <TableCell>{trade.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockAnalysisPage;
