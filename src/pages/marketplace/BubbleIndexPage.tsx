import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar
} from '@mui/material';
import {
  Search,
  BubbleChart,
  Timeline,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Schedule,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh
} from '@mui/icons-material';

// 泡沫指数快照数据类型
interface BubbleSnapshot {
  id: string;
  secRefID: string;
  timestamp: string;
  bubbleIndex: number;
  confidence: number;
  riskLevel: string;
  description: string;
}

// 证券数据类型
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
  bubbleIndex?: number;
  riskLevel?: string;
}

// 市场泡沫快照数据类型
interface MarketBubbleSnapshot {
  record_id: string;
  symbol: string;
  trading_date: string;
  market_cap: number;
  beta_factor: number;
  traded_amount: number;
  traded_qty: number;
  turnover_rate: number;
  top_price: number;
  bottom_price: number;
  pe_ratio: number;
  pb_ratio: number;
  avg_price: number;
  fr_date: string;
}


const BubbleIndexPage: React.FC = () => {
  const [marketSnapshots, setMarketSnapshots] = useState<MarketBubbleSnapshot[]>([]);
  const [searchSymbol, setSearchSymbol] = useState<string>('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<MarketBubbleSnapshot | null>(null);
  const [bubbleSnapshots, setBubbleSnapshots] = useState<BubbleSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [snapshotsLoading, setSnapshotsLoading] = useState<boolean>(true);
  
  // 分页状态
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // 过滤后的快照列表
  const filteredSnapshots = marketSnapshots.filter(snapshot =>
    snapshot.symbol.toLowerCase().includes(searchSymbol.toLowerCase())
  );

  // 分页数据
  const paginatedSnapshots = filteredSnapshots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 分页处理函数
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 获取市场泡沫快照数据
  const fetchMarketSnapshots = async () => {
    setSnapshotsLoading(true);
    setError('');
    try {

      const  securities = ["APP"];
      
      const snapshotsWithBubbleData: MarketBubbleSnapshot[] = [];
      
      // 为每个证券获取泡沫指数数据
      for (const security of securities) {
        try {
          const response = await fetch(`http://localhost:3344/api/marketplace/security/${security}/bubble_snapshot/list`);
          if (response.ok) {
            const data = await response.json();
            const bubbleSnapshots = data.data || [];
            
            // 为每个泡沫快照创建市场快照记录
            bubbleSnapshots.forEach((bubbleSnapshot: any, index: number) => {
              snapshotsWithBubbleData.push({
                record_id: bubbleSnapshot.record_id || `${security}_${index}`,
                symbol: bubbleSnapshot.symbol || security,
                trading_date: bubbleSnapshot.trading_date || new Date().toISOString().split('T')[0],
                market_cap: bubbleSnapshot.market_cap || 0,
                beta_factor: bubbleSnapshot.beta_factor || 1.0,
                traded_amount: bubbleSnapshot.traded_amount || 0,
                traded_qty: bubbleSnapshot.traded_qty || 0,
                turnover_rate: bubbleSnapshot.turnover_rate || 0,
                top_price: bubbleSnapshot.top_price || 0,
                bottom_price: bubbleSnapshot.bottom_price || 0,
                pe_ratio: bubbleSnapshot.pe_ratio || 0,
                pb_ratio: bubbleSnapshot.pb_ratio || 0,
                avg_price: bubbleSnapshot.avg_price || 0,
                fr_date: bubbleSnapshot.fr_date || new Date().toISOString().split('T')[0]
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching bubble data for ${security}:`, error);
        }
      }
      
      setMarketSnapshots(snapshotsWithBubbleData);
    } catch (error) {
      console.error('Error fetching market snapshots:', error);
      setError('获取市场泡沫快照数据失败');
      setMarketSnapshots([]);
    } finally {
      setSnapshotsLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchMarketSnapshots();
  }, []);

  // 获取泡沫指数快照数据
  const fetchBubbleSnapshots = async (snapshot: MarketBubbleSnapshot) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3344/api/marketplace/security/${snapshot.symbol}/bubble_snapshot/list`);
      if (response.ok) {
        const data = await response.json();
        setBubbleSnapshots(data.data || []);
        setSelectedSnapshot(snapshot);
        setDetailDialogOpen(true);
      } else {
        setError(`获取 ${snapshot.symbol} 的泡沫指数数据失败`);
        setBubbleSnapshots([]);
      }
    } catch (error) {
      console.error('Error fetching bubble snapshots:', error);
      setError(`网络错误：无法获取 ${snapshot.symbol} 的泡沫指数数据`);
      setBubbleSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理快照选择
  const handleSnapshotSelect = (snapshot: MarketBubbleSnapshot) => {
    fetchBubbleSnapshots(snapshot);
  };

  // 关闭详情弹窗
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedSnapshot(null);
    setBubbleSnapshots([]);
  };

  // 获取泡沫指数颜色
  const getBubbleIndexColor = (bubbleIndex: number): string => {
    if (bubbleIndex >= 0.8) return '#f44336'; // 高风险 - 红色
    if (bubbleIndex >= 0.6) return '#ff9800'; // 中风险 - 橙色
    if (bubbleIndex >= 0.4) return '#ffeb3b'; // 低风险 - 黄色
    return '#4caf50'; // 安全 - 绿色
  };

  // 获取泡沫指数风险等级
  const getBubbleRiskLevel = (bubbleIndex: number): string => {
    if (bubbleIndex >= 0.8) return '高风险';
    if (bubbleIndex >= 0.6) return '中风险';
    if (bubbleIndex >= 0.4) return '低风险';
    return '安全';
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BubbleChart sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            泡沫指数分析
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchMarketSnapshots}
          disabled={snapshotsLoading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          刷新数据
        </Button>
      </Box>

      {/* 搜索区域 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="搜索证券代码"
          value={searchSymbol}
          onChange={(e) => {
            setSearchSymbol(e.target.value);
            setPage(0); // 搜索时重置到第一页
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          placeholder="例如：AAPL, Apple"
        />
      </Paper>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 加载状态 */}
      {snapshotsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 市场泡沫快照表格 */}
      {!snapshotsLoading && (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>证券代码</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>交易日期</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>市值</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Beta因子</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>成交金额</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>成交量</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>换手率</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>最高价</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>最低价</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>平均价</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>市盈率</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>市净率</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>财报日期</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSnapshots.map((snapshot) => (
                  <TableRow 
                    key={snapshot.record_id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                      },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {snapshot.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {snapshot.trading_date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatNumber(snapshot.market_cap)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {typeof snapshot.beta_factor === 'number' ? snapshot.beta_factor.toFixed(4) : parseFloat(snapshot.beta_factor || 0).toFixed(4)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatNumber(snapshot.traded_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatNumber(snapshot.traded_qty)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {((typeof snapshot.turnover_rate === 'number' ? snapshot.turnover_rate : parseFloat(snapshot.turnover_rate || 0)) * 100).toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {(typeof snapshot.top_price === 'number' ? snapshot.top_price : parseFloat(snapshot.top_price || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {(typeof snapshot.bottom_price === 'number' ? snapshot.bottom_price : parseFloat(snapshot.bottom_price || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {(typeof snapshot.avg_price === 'number' ? snapshot.avg_price : parseFloat(snapshot.avg_price || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {(typeof snapshot.pe_ratio === 'number' ? snapshot.pe_ratio : parseFloat(snapshot.pe_ratio || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {(typeof snapshot.pb_ratio === 'number' ? snapshot.pb_ratio : parseFloat(snapshot.pb_ratio || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {snapshot.fr_date}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<BubbleChart />}
                        onClick={() => handleSnapshotSelect(snapshot)}
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                          }
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

          {/* 分页组件 */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSnapshots.length}
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
        </>
      )}

      {/* 空状态 */}
      {!snapshotsLoading && filteredSnapshots.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info">
            {searchSymbol 
              ? '未找到匹配的快照数据，请尝试其他搜索词。' 
              : '暂无市场泡沫快照数据。'
            }
          </Alert>
        </Box>
      )}

      {/* 泡沫指数详情弹窗 */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <BubbleChart sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedSnapshot?.symbol} 泡沫指数分析
              </Typography>
              <Typography variant="body2" color="text.secondary">
                交易日期: {selectedSnapshot?.trading_date}
              </Typography>
            </Box>
            <IconButton onClick={() => selectedSnapshot && fetchBubbleSnapshots(selectedSnapshot)}>
              <Refresh />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                正在加载泡沫指数数据...
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* 历史快照数据 */}
              {bubbleSnapshots.length > 0 ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Timeline sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      历史快照数据 ({bubbleSnapshots.length} 条)
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    {bubbleSnapshots.map((snapshot, index) => (
                      <Box key={snapshot.id}>
                        <Paper sx={{ 
                          border: '1px solid', 
                          borderColor: getBubbleIndexColor(snapshot.bubbleIndex || 0),
                          '&:hover': { 
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          },
                          p: 2
                        }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  快照 #{index + 1}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(snapshot.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BubbleChart sx={{ fontSize: 18, color: getBubbleIndexColor(snapshot.bubbleIndex || 0) }} />
                                <Typography variant="body2" color="text.secondary">
                                  泡沫指数
                                </Typography>
                              </Box>
                              <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: getBubbleIndexColor(snapshot.bubbleIndex || 0),
                                mb: 1
                              }}>
                                {snapshot.bubbleIndex ? snapshot.bubbleIndex.toFixed(2) : '0.00'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 2,
                              justifyContent: 'space-around'
                            }}>
                              <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                  {snapshot.confidence ? (snapshot.confidence * 100).toFixed(0) : '0'}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  置信度
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600,
                                  color: getBubbleIndexColor(snapshot.bubbleIndex || 0)
                                }}>
                                  {snapshot.riskLevel}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  风险等级
                                </Typography>
                              </Box>
                            </Box>
                            
                            {snapshot.description && (
                              <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {snapshot.description}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Alert 
                  severity="info" 
                  icon={<Info />}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    '& .MuiAlert-message': { flex: 1 }
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      暂无泡沫指数快照数据
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      该证券的泡沫指数历史数据正在收集中，请稍后再查看。
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDetailDialog}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{ minWidth: 120 }}
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BubbleIndexPage;
