import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Star,
  StarBorder,
  TrendingUp,
  TrendingDown,
  Remove,
  BubbleChart,
  Timeline,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Schedule,
  TrendingFlat
} from '@mui/icons-material';

// Securities数据类型
interface Security {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  isFavorite: boolean;
}


// Mock数据
const mockSecurities: Security[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2750000000000,
    sector: 'Technology',
    isFavorite: true
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.25,
    changePercent: -0.33,
    volume: 23456700,
    marketCap: 2810000000000,
    sector: 'Technology',
    isFavorite: true
  },
  {
    id: '3',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.42,
    changePercent: 2.46,
    volume: 18923400,
    marketCap: 1780000000000,
    sector: 'Technology',
    isFavorite: true
  },
  {
    id: '4',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.12,
    change: -5.67,
    changePercent: -2.23,
    volume: 67890100,
    marketCap: 789000000000,
    sector: 'Automotive',
    isFavorite: true
  },
  {
    id: '5',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 155.78,
    change: 1.89,
    changePercent: 1.23,
    volume: 34567800,
    marketCap: 1620000000000,
    sector: 'Consumer Discretionary',
    isFavorite: true
  },
  {
    id: '6',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.34,
    change: 12.45,
    changePercent: 1.44,
    volume: 45678900,
    marketCap: 2150000000000,
    sector: 'Technology',
    isFavorite: true
  },
  {
    id: '7',
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 485.67,
    change: -2.34,
    changePercent: -0.48,
    volume: 23456700,
    marketCap: 1230000000000,
    sector: 'Technology',
    isFavorite: true
  },
  {
    id: '8',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 198.45,
    change: 0.78,
    changePercent: 0.39,
    volume: 12345600,
    marketCap: 580000000000,
    sector: 'Financial Services',
    isFavorite: true
  }
];

const FavoritesPage: React.FC = () => {
  const [securities] = useState<Security[]>(mockSecurities);
  const [searchSymbol, setSearchSymbol] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  

  // 过滤和搜索逻辑
  const filteredSecurities = useMemo(() => {
    let filtered = securities.filter(security => security.isFavorite);

    // Symbol搜索
    if (searchSymbol) {
      filtered = filtered.filter(security =>
        security.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
        security.name.toLowerCase().includes(searchSymbol.toLowerCase())
      );
    }

    // 价格搜索
    if (priceFilter) {
      const price = parseFloat(priceFilter);
      if (!isNaN(price)) {
        filtered = filtered.filter(security => security.price >= price);
      }
    }

    return filtered;
  }, [securities, searchSymbol, priceFilter]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredSecurities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSecurities = filteredSecurities.slice(startIndex, endIndex);

  // 处理分页变化
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // 处理每页条数变化
  const handleItemsPerPageChange = (event: any) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理收藏状态切换
  const handleFavoriteToggle = (securityId: string) => {
    // 这里可以添加实际的收藏/取消收藏逻辑
    console.log('Toggle favorite for security:', securityId);
  };


  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  // 获取变化颜色
  const getChangeColor = (change: number): string => {
    if (change > 0) return '#4caf50';
    if (change < 0) return '#f44336';
    return '#666';
  };


  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Watchlist
        </Typography>
      </Box>

      {/* 搜索和过滤区域 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', p: 3, mb: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3 
        }}>
          <TextField
            fullWidth
            label="Search by Symbol or Name"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            placeholder="e.g., AAPL, Apple"
          />
          <TextField
            fullWidth
            label="Minimum Price"
            type="number"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            placeholder="e.g., 100"
          />
        </Box>
      </Paper>

      {/* 统计信息 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredSecurities.length} of {securities.filter(s => s.isFavorite).length} favorite securities
        </Typography>
      </Box>

      {/* Securities列表 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Change</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Volume</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Market Cap</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sector</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentSecurities.map((security) => (
                <TableRow key={security.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {security.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {security.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${security.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {security.change > 0 ? (
                        <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                      ) : security.change < 0 ? (
                        <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
                      ) : (
                        <Remove sx={{ fontSize: 16, color: '#666' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: getChangeColor(security.change),
                          fontWeight: 500
                        }}
                      >
                        {security.change > 0 ? '+' : ''}{security.change.toFixed(2)} ({security.changePercent > 0 ? '+' : ''}{security.changePercent.toFixed(2)}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatNumber(security.volume)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${formatNumber(security.marketCap)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={security.sector}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remove from favorites">
                      <IconButton
                        size="small"
                        onClick={() => handleFavoriteToggle(security.id)}
                        sx={{ color: '#ff9800' }}
                      >
                        <Star />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 分页 */}
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
            共 {filteredSecurities.length} 条记录，第 {currentPage} 页，共 {totalPages} 页
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              每页显示：
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
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
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size="small"
            />
          </Stack>
        </Box>
      </Paper>

      {/* 空状态 */}
      {filteredSecurities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info">
            {searchSymbol || priceFilter 
              ? 'No securities found matching your criteria.' 
              : 'No favorite securities found. Add some securities to your favorites to see them here.'
            }
          </Alert>
        </Box>
      )}

    </Box>
  );
};

export default FavoritesPage;
