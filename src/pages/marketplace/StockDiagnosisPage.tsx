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
  Button,
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
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import {
  Search,
  Assessment,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Info,
  Timeline,
  Analytics,
  Speed,
  Security,
  Psychology,
  ShowChart
} from '@mui/icons-material';

// 股票诊断数据类型
interface StockDiagnosis {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  diagnosisScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  lastUpdated: string;
}

// Mock数据
const mockStockDiagnoses: StockDiagnosis[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2750000000000,
    sector: 'Technology',
    diagnosisScore: 85,
    riskLevel: 'LOW',
    technicalScore: 88,
    fundamentalScore: 82,
    sentimentScore: 85,
    recommendation: 'BUY',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 378.85,
    change: -1.25,
    changePercent: -0.33,
    volume: 23456700,
    marketCap: 2810000000000,
    sector: 'Technology',
    diagnosisScore: 78,
    riskLevel: 'LOW',
    technicalScore: 75,
    fundamentalScore: 85,
    sentimentScore: 74,
    recommendation: 'HOLD',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '3',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    currentPrice: 248.12,
    change: -5.67,
    changePercent: -2.23,
    volume: 67890100,
    marketCap: 789000000000,
    sector: 'Automotive',
    diagnosisScore: 45,
    riskLevel: 'HIGH',
    technicalScore: 40,
    fundamentalScore: 50,
    sentimentScore: 45,
    recommendation: 'SELL',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '4',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 875.34,
    change: 12.45,
    changePercent: 1.44,
    volume: 45678900,
    marketCap: 2150000000000,
    sector: 'Technology',
    diagnosisScore: 92,
    riskLevel: 'MEDIUM',
    technicalScore: 95,
    fundamentalScore: 88,
    sentimentScore: 93,
    recommendation: 'BUY',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '5',
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    currentPrice: 485.67,
    change: -2.34,
    changePercent: -0.48,
    volume: 23456700,
    marketCap: 1230000000000,
    sector: 'Technology',
    diagnosisScore: 65,
    riskLevel: 'MEDIUM',
    technicalScore: 60,
    fundamentalScore: 70,
    sentimentScore: 65,
    recommendation: 'HOLD',
    lastUpdated: '2024-01-15 10:30:00'
  }
];

const StockDiagnosisPage: React.FC = () => {
  const [diagnoses] = useState<StockDiagnosis[]>(mockStockDiagnoses);
  const [searchSymbol, setSearchSymbol] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<StockDiagnosis | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 过滤逻辑
  const filteredDiagnoses = useMemo(() => {
    let filtered = diagnoses;

    if (searchSymbol) {
      filtered = filtered.filter(diagnosis =>
        diagnosis.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
        diagnosis.name.toLowerCase().includes(searchSymbol.toLowerCase())
      );
    }

    if (sectorFilter) {
      filtered = filtered.filter(diagnosis => diagnosis.sector === sectorFilter);
    }

    if (riskFilter) {
      filtered = filtered.filter(diagnosis => diagnosis.riskLevel === riskFilter);
    }

    if (recommendationFilter) {
      filtered = filtered.filter(diagnosis => diagnosis.recommendation === recommendationFilter);
    }

    return filtered;
  }, [diagnoses, searchSymbol, sectorFilter, riskFilter, recommendationFilter]);

  // 分页逻辑
  const paginatedDiagnoses = filteredDiagnoses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 处理分页变化
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 处理诊断详情查看
  const handleDiagnosisClick = (diagnosis: StockDiagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDiagnosis(null);
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

  // 获取风险等级颜色
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'LOW': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#f44336';
      default: return '#666';
    }
  };

  // 获取推荐颜色
  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'BUY': return '#4caf50';
      case 'HOLD': return '#ff9800';
      case 'SELL': return '#f44336';
      default: return '#666';
    }
  };

  // 获取诊断分数颜色
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  // 获取所有行业
  const sectors = Array.from(new Set(diagnoses.map(d => d.sector)));

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          股票诊断
        </Typography>
      </Box>

      {/* 搜索和过滤区域 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', p: 3, mb: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
          gap: 3 
        }}>
          <TextField
            fullWidth
            label="搜索股票代码或名称"
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
          <FormControl fullWidth>
            <InputLabel>行业筛选</InputLabel>
            <Select
              value={sectorFilter}
              label="行业筛选"
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <MenuItem value="">全部行业</MenuItem>
              {sectors.map(sector => (
                <MenuItem key={sector} value={sector}>{sector}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>风险等级</InputLabel>
            <Select
              value={riskFilter}
              label="风险等级"
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <MenuItem value="">全部风险等级</MenuItem>
              <MenuItem value="LOW">低风险</MenuItem>
              <MenuItem value="MEDIUM">中风险</MenuItem>
              <MenuItem value="HIGH">高风险</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>投资建议</InputLabel>
            <Select
              value={recommendationFilter}
              label="投资建议"
              onChange={(e) => setRecommendationFilter(e.target.value)}
            >
              <MenuItem value="">全部建议</MenuItem>
              <MenuItem value="BUY">买入</MenuItem>
              <MenuItem value="HOLD">持有</MenuItem>
              <MenuItem value="SELL">卖出</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 统计信息 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          显示 {filteredDiagnoses.length} 个股票诊断结果
        </Typography>
      </Box>

      {/* 股票诊断列表 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>股票代码</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>公司名称</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>当前价格</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>涨跌幅</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>诊断分数</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>风险等级</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>投资建议</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDiagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {diagnosis.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {diagnosis.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${diagnosis.currentPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {diagnosis.change > 0 ? (
                        <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                      ) : diagnosis.change < 0 ? (
                        <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
                      ) : null}
                      <Typography
                        variant="body2"
                        sx={{
                          color: getChangeColor(diagnosis.change),
                          fontWeight: 500
                        }}
                      >
                        {diagnosis.change > 0 ? '+' : ''}{diagnosis.change.toFixed(2)} ({diagnosis.changePercent > 0 ? '+' : ''}{diagnosis.changePercent.toFixed(2)}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: getScoreColor(diagnosis.diagnosisScore)
                      }}
                    >
                      {diagnosis.diagnosisScore}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={diagnosis.riskLevel === 'LOW' ? '低风险' : diagnosis.riskLevel === 'MEDIUM' ? '中风险' : '高风险'}
                      size="small"
                      sx={{
                        backgroundColor: getRiskColor(diagnosis.riskLevel),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={diagnosis.recommendation === 'BUY' ? '买入' : diagnosis.recommendation === 'HOLD' ? '持有' : '卖出'}
                      size="small"
                      sx={{
                        backgroundColor: getRecommendationColor(diagnosis.recommendation),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Assessment />}
                      onClick={() => handleDiagnosisClick(diagnosis)}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        textTransform: 'none'
                      }}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 分页 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredDiagnoses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count} 条`}
          sx={{
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            '& .MuiTablePagination-toolbar': {
              paddingLeft: 0,
              paddingRight: 0
            }
          }}
        />
      </Paper>

      {/* 空状态 */}
      {filteredDiagnoses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info">
            {searchSymbol || sectorFilter || riskFilter || recommendationFilter
              ? '没有找到符合条件的股票诊断结果。'
              : '暂无股票诊断数据。'
            }
          </Alert>
        </Box>
      )}

      {/* 诊断详情弹窗 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            <Typography variant="h6">
              {selectedDiagnosis?.symbol} - {selectedDiagnosis?.name} 诊断详情
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDiagnosis && (
            <Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
              }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      基本信息
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="当前价格"
                          secondary={`$${selectedDiagnosis.currentPrice.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="涨跌幅"
                          secondary={`${selectedDiagnosis.change > 0 ? '+' : ''}${selectedDiagnosis.change.toFixed(2)} (${selectedDiagnosis.changePercent > 0 ? '+' : ''}${selectedDiagnosis.changePercent.toFixed(2)}%)`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="成交量"
                          secondary={formatNumber(selectedDiagnosis.volume)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="市值"
                          secondary={`$${formatNumber(selectedDiagnosis.marketCap)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="行业"
                          secondary={selectedDiagnosis.sector}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      诊断评分
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="综合诊断分数"
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{ color: getScoreColor(selectedDiagnosis.diagnosisScore) }}
                              >
                                {selectedDiagnosis.diagnosisScore}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                / 100
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="技术分析分数"
                          secondary={`${selectedDiagnosis.technicalScore} / 100`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="基本面分析分数"
                          secondary={`${selectedDiagnosis.fundamentalScore} / 100`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="市场情绪分数"
                          secondary={`${selectedDiagnosis.sentimentScore} / 100`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="风险等级"
                          secondary={
                            <Chip
                              label={selectedDiagnosis.riskLevel === 'LOW' ? '低风险' : selectedDiagnosis.riskLevel === 'MEDIUM' ? '中风险' : '高风险'}
                              size="small"
                              sx={{
                                backgroundColor: getRiskColor(selectedDiagnosis.riskLevel),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="投资建议"
                          secondary={
                            <Chip
                              label={selectedDiagnosis.recommendation === 'BUY' ? '买入' : selectedDiagnosis.recommendation === 'HOLD' ? '持有' : '卖出'}
                              size="small"
                              sx={{
                                backgroundColor: getRecommendationColor(selectedDiagnosis.recommendation),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="最后更新"
                          secondary={selectedDiagnosis.lastUpdated}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
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

export default StockDiagnosisPage;
