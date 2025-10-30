import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Refresh,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Assessment,
  Timeline,
  BarChart,
  ScatterPlot
} from '@mui/icons-material';

// 期权数据类型
interface OptionData {
  id: string;
  symbol: string;
  strikePrice: number;
  expiryDate: string;
  optionType: 'call' | 'put';
  volume: number;
  price: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

// 时间序列数据类型
interface TimeSeriesData {
  date: string;
  price: number;
  volume: number;
}

// Series数据类型
interface SeriesData {
  id: string;
  name: string;
  symbol: string;
  optionType: 'call' | 'put';
  strikePrice: number;
  expiryDate: string;
  color: string;
  data: TimeSeriesData[];
  visible: boolean;
}

// 模拟时间序列数据生成
const generateMockTimeSeriesData = (): SeriesData[] => {
  const series: SeriesData[] = [];
  const colors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];
  
  // 生成多个期权系列
  const symbols = ['AAPL', 'TSLA', 'MSFT'];
  const optionTypes: ('call' | 'put')[] = ['call', 'put'];
  
  symbols.forEach((symbol, symbolIndex) => {
    optionTypes.forEach((type, typeIndex) => {
      const seriesId = `${symbol}_${type}_${Date.now()}`;
      const strikePrice = 100 + (symbolIndex * 20) + (typeIndex * 10);
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // 生成30天的时间序列数据
      const timeSeriesData: TimeSeriesData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      let basePrice = 50 + Math.random() * 100;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // 模拟价格波动
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility;
        basePrice = basePrice * (1 + change);
        
        // 模拟成交量
        const volume = Math.floor(Math.random() * 5000) + 100;
        
        timeSeriesData.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(basePrice * 100) / 100,
          volume
        });
      }
      
      series.push({
        id: seriesId,
        name: `${symbol} ${type.toUpperCase()} $${strikePrice}`,
        symbol,
        optionType: type,
        strikePrice,
        expiryDate,
        color: colors[(symbolIndex * 2 + typeIndex) % colors.length],
        data: timeSeriesData,
        visible: true
      });
    });
  });
  
  return series;
};

const OptionsAnalysisPage: React.FC = () => {
  const [optionsData, setOptionsData] = useState<OptionData[]>([]);
  const [filteredData, setFilteredData] = useState<OptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [optionTypeFilter, setOptionTypeFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [chartData, setChartData] = useState<{x: number, y: number, label: string}[]>([]);
  
  // 编辑功能状态
  const [editingData, setEditingData] = useState<OptionData[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // 时间序列数据状态
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 初始化空数据
    setOptionsData([]);
    setFilteredData([]);
    setEditingData([]);
    
    // 加载时间序列数据
    setTimeout(() => {
      const mockSeriesData = generateMockTimeSeriesData();
      setSeriesData(mockSeriesData);
      setSelectedSeries(new Set(mockSeriesData.map(s => s.id))); // 默认全选
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // 过滤数据 - 使用编辑数据
    const dataSource = editingData.length > 0 ? editingData : optionsData;
    let filtered = dataSource;

    if (selectedSymbol) {
      filtered = filtered.filter(option => option.symbol === selectedSymbol);
    }

    if (optionTypeFilter) {
      filtered = filtered.filter(option => option.optionType === optionTypeFilter);
    }

    if (expiryFilter) {
      const filterDate = new Date(expiryFilter);
      filtered = filtered.filter(option => {
        const optionDate = new Date(option.expiryDate);
        return optionDate <= filterDate;
      });
    }

    setFilteredData(filtered);

    // 生成图表数据 - 显示所有过滤后的数据，如果没有任何选中项则显示所有数据
    const selectedData = selectedItems.size > 0 
      ? filtered.filter(option => selectedItems.has(option.id))
      : filtered;
    const chartPoints = selectedData.map(option => ({
      x: option.strikePrice,
      y: option.volume,
      label: `${option.symbol} ${option.optionType.toUpperCase()} ${option.strikePrice}`
    }));
    setChartData(chartPoints);
  }, [optionsData, editingData, selectedSymbol, optionTypeFilter, expiryFilter, selectedItems]);

  // 初始化编辑数据 - 不再自动同步

  const handleSearch = () => {
    if (searchSymbol) {
      setSelectedSymbol(searchSymbol.toUpperCase());
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // 清空所有数据
      setOptionsData([]);
      setFilteredData([]);
      setEditingData([]);
      setSelectedItems(new Set());
      setLoading(false);
    }, 500);
  };

  // 编辑功能处理函数
  const handleEditData = (id: string, field: keyof OptionData, value: any) => {
    setEditingData(prev => {
      const newData = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      console.log('编辑数据:', { id, field, value, newData: newData.find(item => item.id === id) });
      return newData;
    });
  };

  const handleToggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    }
  };

  const handleApplyChanges = () => {
    setOptionsData(editingData);
    setFilteredData(editingData);
  };

  const handleDeleteData = (id: string) => {
    setEditingData(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Series选择功能
  const handleToggleSeries = (seriesId: string) => {
    setSelectedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  const handleSelectAllSeries = () => {
    if (selectedSeries.size === seriesData.length) {
      setSelectedSeries(new Set());
    } else {
      setSelectedSeries(new Set(seriesData.map(s => s.id)));
    }
  };

  const getSymbols = () => {
    return Array.from(new Set(optionsData.map(option => option.symbol)));
  };

  const getExpiryDates = () => {
    return Array.from(new Set(optionsData.map(option => option.expiryDate))).sort();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            期权分析
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            期权成交价格与成交量分析
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            刷新数据
          </Button>
        </Box>
      </Box>

      {/* 搜索和筛选 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            搜索和筛选
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
            gap: 3 
          }}>
            <TextField
              fullWidth
              label="搜索股票代码"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="e.g., AAPL"
            />
            <FormControl fullWidth>
              <InputLabel>选择股票</InputLabel>
              <Select
                value={selectedSymbol}
                label="选择股票"
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                <MenuItem value="">全部股票</MenuItem>
                {getSymbols().map(symbol => (
                  <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>期权类型</InputLabel>
              <Select
                value={optionTypeFilter}
                label="期权类型"
                onChange={(e) => setOptionTypeFilter(e.target.value)}
              >
                <MenuItem value="">全部类型</MenuItem>
                <MenuItem value="call">Call</MenuItem>
                <MenuItem value="put">Put</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>到期日期</InputLabel>
              <Select
                value={expiryFilter}
                label="到期日期"
                onChange={(e) => setExpiryFilter(e.target.value)}
              >
                <MenuItem value="">全部日期</MenuItem>
                {getExpiryDates().map(date => (
                  <MenuItem key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Search />}
            >
              搜索
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
        gap: 3, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BarChart color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">总期权数</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {filteredData.length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">总成交量</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatNumber(filteredData.reduce((sum, option) => sum + option.volume, 0))}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Assessment color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">平均价格</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatCurrency(filteredData.reduce((sum, option) => sum + option.price, 0) / filteredData.length || 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Timeline color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">平均隐含波动率</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {((filteredData.reduce((sum, option) => sum + option.impliedVolatility, 0) / filteredData.length || 0) * 100).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 手动输入数据区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              手动输入数据
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Assessment />}
                onClick={() => {
                  const newOption: OptionData = {
                    id: `new_${Date.now()}`,
                    symbol: '',
                    strikePrice: 0,
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    optionType: 'call',
                    volume: 0,
                    price: 0,
                    openInterest: 0,
                    impliedVolatility: 0,
                    delta: 0,
                    gamma: 0,
                    theta: 0,
                    vega: 0,
                    rho: 0
                  };
                  setEditingData(prev => [...prev, newOption]);
                }}
              >
                添加新数据
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAll}
              >
                {selectedItems.size === filteredData.length ? '取消全选' : '全选'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                已选择 {selectedItems.size} / {filteredData.length} 项
              </Typography>
            </Box>
          </Box>
          
          {/* 数据输入表单 */}
          <Box sx={{ 
            maxHeight: 500,
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}>
            {/* 表头 */}
            {editingData.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {/* 选择框列 */}
                <Box sx={{ mr: 2, width: 24 }}>
                  <input type="checkbox" disabled style={{ transform: 'scale(1.2)' }} />
                </Box>
                
                {/* 基本信息列 */}
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>
                      股票代码
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>
                      期权类型
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, width: 150, textAlign: 'center' }}>
                      到期日期
                    </Typography>
                    <Box sx={{ width: 80 }}></Box> {/* 删除按钮占位 */}
                  </Box>
                </Box>
                
                {/* 数据列 */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    行权价
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    期权成交价
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    成交量
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    持仓量
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    隐含波动率
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    Delta
                  </Typography>
                </Box>
              </Box>
            )}
            
            {editingData.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  暂无期权数据
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  点击"添加新数据"按钮开始输入期权信息
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Assessment />}
                  onClick={() => {
                    const newOption: OptionData = {
                      id: `new_${Date.now()}`,
                      symbol: '',
                      strikePrice: 0,
                      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      optionType: 'call',
                      volume: 0,
                      price: 0,
                      openInterest: 0,
                      impliedVolatility: 0,
                      delta: 0,
                      gamma: 0,
                      theta: 0,
                      vega: 0,
                      rho: 0
                    };
                    setEditingData([newOption]);
                  }}
                >
                  添加第一条数据
                </Button>
              </Box>
            ) : (
              editingData.map((option) => (
              <Box key={option.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedItems.has(option.id) ? '#e3f2fd' : 'transparent',
                '&:hover': { backgroundColor: selectedItems.has(option.id) ? '#bbdefb' : '#f5f5f5' }
              }}>
                {/* 选择框 */}
                <Box sx={{ mr: 2 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(option.id)}
                    onChange={() => handleToggleSelection(option.id)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </Box>
                
                {/* 基本信息 */}
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      label="股票代码"
                      value={option.symbol}
                      onChange={(e) => handleEditData(option.id, 'symbol', e.target.value)}
                      sx={{ width: 100 }}
                      placeholder="AAPL"
                    />
                    <Select
                      size="small"
                      value={option.optionType}
                      onChange={(e) => handleEditData(option.id, 'optionType', e.target.value)}
                      sx={{ width: 100 }}
                    >
                      <MenuItem value="call">Call</MenuItem>
                      <MenuItem value="put">Put</MenuItem>
                    </Select>
                    <TextField
                      size="small"
                      type="date"
                      label="到期日期"
                      value={option.expiryDate}
                      onChange={(e) => handleEditData(option.id, 'expiryDate', e.target.value)}
                      sx={{ width: 150 }}
                    />
                    {option.id.startsWith('new_') && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteData(option.id)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        删除
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {/* 可编辑字段 */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* 行权价 */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="行权价"
                      type="number"
                      value={option.strikePrice}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleEditData(option.id, 'strikePrice', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Box>
                  
                  {/* 期权成交价 */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="期权成交价"
                      type="number"
                      value={option.price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleEditData(option.id, 'price', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Box>
                  
                  {/* 成交量 */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="成交量"
                      type="number"
                      value={option.volume}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleEditData(option.id, 'volume', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                  
                  {/* 持仓量 */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="持仓量"
                      type="number"
                      value={option.openInterest}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleEditData(option.id, 'openInterest', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                  
                  {/* 隐含波动率 */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="隐含波动率"
                      type="number"
                      value={option.impliedVolatility}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleEditData(option.id, 'impliedVolatility', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ step: 0.01, min: 0, max: 1 }}
                    />
                  </Box>
                  
                  {/* Delta */}
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      label="Delta"
                      type="number"
                      value={option.delta}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleEditData(option.id, 'delta', value);
                      }}
                      sx={{ width: 100 }}
                      inputProps={{ step: 0.01 }}
                    />
                  </Box>
                </Box>
              </Box>
              ))
            )}
          </Box>
          
          {/* 操作按钮 */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingData([]);
                setOptionsData([]);
                setFilteredData([]);
                setSelectedItems(new Set());
              }}
            >
              清空数据
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyChanges}
            >
              保存更改
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 期权时间序列分析图表 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Timeline sx={{ mr: 1 }} />
              期权时间序列分析
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAllSeries}
              >
                {selectedSeries.size === seriesData.length ? '取消全选' : '全选'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                已选择 {selectedSeries.size} / {seriesData.length} 个系列
              </Typography>
            </Box>
          </Box>
          
          {/* Series选择器 */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {seriesData.map((series) => (
              <Box
                key={series.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: selectedSeries.has(series.id) ? '#e3f2fd' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedSeries.has(series.id) ? '#bbdefb' : '#f5f5f5'
                  }
                }}
                onClick={() => handleToggleSeries(series.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedSeries.has(series.id)}
                  onChange={() => handleToggleSeries(series.id)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <Box sx={{ 
                  width: 12, 
                  height: 3, 
                  backgroundColor: series.color,
                  borderRadius: 1
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {series.name}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* 曲线图 */}
          <Box sx={{ 
            height: 400, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            p: 2,
            backgroundColor: '#fafafa',
            position: 'relative'
          }}>
            {(() => {
              const visibleSeries = seriesData.filter(s => selectedSeries.has(s.id));
              if (visibleSeries.length === 0) {
                return (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2">
                      请选择要显示的期权系列
                    </Typography>
                  </Box>
                );
              }
              
              // 计算价格范围
              const allPrices = visibleSeries.flatMap(s => s.data.map(d => d.price));
              const minPrice = Math.min(...allPrices);
              const maxPrice = Math.max(...allPrices);
              const priceRange = maxPrice - minPrice;
              
              // 计算时间范围
              const allDates = visibleSeries.flatMap(s => s.data.map(d => d.date));
              const uniqueDates = Array.from(new Set(allDates)).sort();
              const dateRange = uniqueDates.length;
              
              return (
                <Box sx={{ 
                  height: '100%', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Y轴标签和网格线 */}
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    height: '100%', 
                    width: '100%',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    pr: 1
                  }}>
                    {/* Y轴刻度 */}
                    {Array.from({ length: 6 }, (_, i) => {
                      const value = minPrice + (priceRange * i / 5);
                      const yPercent = (i / 5) * 100;
                      return (
                        <Box key={i} sx={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: `${100 - yPercent}%`, 
                          width: '100%',
                          borderTop: '1px dashed #ddd',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Typography variant="caption" sx={{ 
                            backgroundColor: '#fafafa', 
                            px: 1, 
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            ${value.toFixed(2)}
                          </Typography>
                        </Box>
                      );
                    })}
                    
                    <Typography variant="caption" sx={{ 
                      position: 'absolute',
                      left: -30,
                      top: '50%',
                      transform: 'rotate(-90deg)',
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      价格
                    </Typography>
                  </Box>
                  
                  {/* 曲线图数据 */}
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    pl: 4,
                    pr: 2,
                    pb: 2
                  }}>
                    {visibleSeries.map((series) => (
                      <Box key={series.id}>
                        {/* 绘制平滑曲线 */}
                        <svg
                          width="100%"
                          height="100%"
                          style={{ position: 'absolute', top: 0, left: 0 }}
                        >
                          {/* 计算贝塞尔曲线控制点 */}
                          {(() => {
                            const points = series.data.map((point, index) => {
                              const x = (index / (series.data.length - 1)) * 100;
                              const y = 100 - ((point.price - minPrice) / priceRange) * 100;
                              return { x, y };
                            });
                            
                            if (points.length < 2) return null;
                            
                            // 生成平滑的贝塞尔曲线路径
                            const createSmoothPath = (points: {x: number, y: number}[]) => {
                              if (points.length < 2) return '';
                              
                              let path = `M ${points[0].x}% ${points[0].y}%`;
                              
                              for (let i = 1; i < points.length; i++) {
                                const prev = points[i - 1];
                                const curr = points[i];
                                const next = points[i + 1];
                                
                                if (i === 1) {
                                  // 第一个控制点
                                  const cp1x = prev.x + (curr.x - prev.x) / 3;
                                  const cp1y = prev.y;
                                  const cp2x = curr.x - (next ? (next.x - prev.x) / 6 : (curr.x - prev.x) / 3);
                                  const cp2y = curr.y;
                                  path += ` C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${curr.x}% ${curr.y}%`;
                                } else if (i === points.length - 1) {
                                  // 最后一个控制点
                                  const cp1x = prev.x + (curr.x - prev.x) / 3;
                                  const cp1y = prev.y;
                                  const cp2x = curr.x - (curr.x - prev.x) / 3;
                                  const cp2y = curr.y;
                                  path += ` C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${curr.x}% ${curr.y}%`;
                                } else {
                                  // 中间控制点
                                  const cp1x = prev.x + (curr.x - prev.x) / 3;
                                  const cp1y = prev.y;
                                  const cp2x = curr.x - (next.x - prev.x) / 6;
                                  const cp2y = curr.y;
                                  path += ` C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${curr.x}% ${curr.y}%`;
                                }
                              }
                              
                              return path;
                            };
                            
                            const smoothPath = createSmoothPath(points);
                            
                            return (
                              <>
                                {/* 绘制平滑曲线 */}
                                <path
                                  d={smoothPath}
                                  stroke={series.color}
                                  strokeWidth="2"
                                  fill="none"
                                  opacity={0.8}
                                />
                                
                                {/* 数据点 */}
                                {series.data.map((point, index) => {
                                  const x = (index / (series.data.length - 1)) * 100;
                                  const y = 100 - ((point.price - minPrice) / priceRange) * 100;
                                  return (
                                    <Tooltip key={index} title={`${series.name}: ${point.date}, $${point.price}`}>
                                      <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="3"
                                        fill={series.color}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* X轴标签 */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: -20, 
                    left: 0, 
                    right: 0, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    pt: 1
                  }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}>
                      {uniqueDates[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}>
                      时间
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}>
                      {uniqueDates[uniqueDates.length - 1]}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};

export default OptionsAnalysisPage;
