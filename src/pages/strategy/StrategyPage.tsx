import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Save,
  Cancel,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle
} from '@mui/icons-material';

// 资产数据类型
interface Asset {
  symbol: string;
  name: string;
  position: number; // 仓位比例 (0-100)
  type: 'long' | 'short'; // 做多或做空
}

// 策略数据类型
interface Strategy {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  maxShortValue: number;
  maxLongValue: number;
  industries: string[];
  sectors: string[];
  assets: Asset[]; // 资产组合
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 风险级别配置
const riskLevelConfig = {
  low: { label: '低风险', color: 'success' as const, icon: <CheckCircle /> },
  medium: { label: '中风险', color: 'warning' as const, icon: <Warning /> },
  high: { label: '高风险', color: 'error' as const, icon: <TrendingUp /> }
};

// 模拟数据
const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: '价值投资策略',
    riskLevel: 'low',
    maxShortValue: 100000,
    maxLongValue: 500000,
    industries: ['金融', '科技'],
    sectors: ['银行', '软件'],
    assets: [
      { symbol: 'AAPL', name: '苹果公司', position: 25, type: 'long' },
      { symbol: 'JPM', name: '摩根大通', position: 20, type: 'long' },
      { symbol: 'MSFT', name: '微软', position: 15, type: 'long' },
      { symbol: 'BRK.B', name: '伯克希尔哈撒韦', position: 10, type: 'long' }
    ],
    notes: '专注于基本面分析，长期持有优质股票',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: '成长股策略',
    riskLevel: 'medium',
    maxShortValue: 200000,
    maxLongValue: 800000,
    industries: ['科技', '医疗'],
    sectors: ['人工智能', '生物医药'],
    assets: [
      { symbol: 'TSLA', name: '特斯拉', position: 30, type: 'long' },
      { symbol: 'NVDA', name: '英伟达', position: 25, type: 'long' },
      { symbol: 'MRNA', name: 'Moderna', position: 15, type: 'long' },
      { symbol: 'ARKK', name: 'ARK创新ETF', position: 10, type: 'long' }
    ],
    notes: '投资高成长潜力的科技和医疗股',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    name: '量化对冲策略',
    riskLevel: 'high',
    maxShortValue: 500000,
    maxLongValue: 1000000,
    industries: ['金融', '科技'],
    sectors: ['量化交易', '算法交易'],
    assets: [
      { symbol: 'SPY', name: '标普500ETF', position: 40, type: 'long' },
      { symbol: 'QQQ', name: '纳斯达克ETF', position: 20, type: 'short' },
      { symbol: 'VIX', name: '波动率指数', position: 15, type: 'short' },
      { symbol: 'GLD', name: '黄金ETF', position: 10, type: 'long' }
    ],
    notes: '基于数学模型和算法的高频交易策略',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-22'
  }
];

const StrategyPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState<Partial<Strategy>>({});
  const [openRiskDialog, setOpenRiskDialog] = useState(false);
  const [selectedRiskStrategy, setSelectedRiskStrategy] = useState<Strategy | null>(null);

  // 分页计算
  const totalPages = Math.ceil(strategies.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentStrategies = strategies.slice(startIndex, endIndex);

  // 打开编辑对话框
  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData(strategy);
    setOpenDialog(true);
  };

  // 打开新建对话框
  const handleAdd = () => {
    setEditingStrategy(null);
    setFormData({
      name: '',
      riskLevel: 'medium',
      maxShortValue: 0,
      maxLongValue: 0,
      industries: [],
      sectors: [],
      assets: [],
      notes: ''
    });
    setOpenDialog(true);
  };

  // 保存策略
  const handleSave = () => {
    if (editingStrategy) {
      // 更新现有策略
      setStrategies(prev => prev.map(s => 
        s.id === editingStrategy.id 
          ? { ...s, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : s
      ));
    } else {
      // 添加新策略
      const newStrategy: Strategy = {
        id: Date.now().toString(),
        name: formData.name || '',
        riskLevel: formData.riskLevel || 'medium',
        maxShortValue: formData.maxShortValue || 0,
        maxLongValue: formData.maxLongValue || 0,
        industries: formData.industries || [],
        sectors: formData.sectors || [],
        assets: formData.assets || [],
        notes: formData.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setStrategies(prev => [newStrategy, ...prev]);
    }
    setOpenDialog(false);
    setFormData({});
  };

  // 删除策略
  const handleDelete = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  // 处理VaR分析
  const handleVaRAnalysis = (strategy: Strategy) => {
    // 跳转到VaR分析页面，传递策略信息
    const assets = strategy.assets.map(asset => asset.symbol).join(',');
    const assetsData = JSON.stringify(strategy.assets);
    window.open(`/var-analysis?strategy=${strategy.id}&name=${encodeURIComponent(strategy.name)}&assets=${encodeURIComponent(assets)}&assetsData=${encodeURIComponent(assetsData)}`, '_blank');
  };

  // 查看风险详情
  const handleViewRisk = (strategy: Strategy) => {
    setSelectedRiskStrategy(strategy);
    setOpenRiskDialog(true);
  };

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box>
      {/* 页面标题和操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          投资策略管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{ borderRadius: 2 }}
        >
          新建策略
        </Button>
      </Box>

      {/* 策略列表 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>策略名称</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>风险级别</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>仓位限制</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>资产组合</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>行业板块</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>备注</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value at Risk</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentStrategies.map((strategy) => (
                <TableRow key={strategy.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {strategy.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={riskLevelConfig[strategy.riskLevel].icon}
                      label={riskLevelConfig[strategy.riskLevel].label}
                      color={riskLevelConfig[strategy.riskLevel].color}
                      size="small"
                      onClick={() => handleViewRisk(strategy)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        做多: {formatCurrency(strategy.maxLongValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        做空: {formatCurrency(strategy.maxShortValue)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {strategy.assets.slice(0, 3).map((asset, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={asset.symbol}
                            size="small"
                            color={asset.type === 'long' ? 'success' : 'error'}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {asset.position}%
                          </Typography>
                        </Box>
                      ))}
                      {strategy.assets.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{strategy.assets.length - 3} 更多...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {strategy.industries.map((industry, index) => (
                        <Chip key={index} label={industry} size="small" variant="outlined" />
                      ))}
                      {strategy.sectors.map((sector, index) => (
                        <Chip key={index} label={sector} size="small" color="primary" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {strategy.notes || '无备注'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleVaRAnalysis(strategy)}
                      sx={{ 
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 1.5
                      }}
                    >
                      分析
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="编辑">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(strategy)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(strategy.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 分页 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* 编辑/新建对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStrategy ? '编辑策略' : '新建策略'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="策略名称"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>风险级别</InputLabel>
              <Select
                value={formData.riskLevel || 'medium'}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                label="风险级别"
              >
                <MenuItem value="low">低风险</MenuItem>
                <MenuItem value="medium">中风险</MenuItem>
                <MenuItem value="high">高风险</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="最高做多价值"
                type="number"
                value={formData.maxLongValue || 0}
                onChange={(e) => setFormData({ ...formData, maxLongValue: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="最高做空价值"
                type="number"
                value={formData.maxShortValue || 0}
                onChange={(e) => setFormData({ ...formData, maxShortValue: Number(e.target.value) })}
                fullWidth
              />
            </Box>

            <TextField
              label="行业 (用逗号分隔)"
              value={formData.industries?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                industries: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              fullWidth
              placeholder="例如: 金融, 科技, 医疗"
            />

            <TextField
              label="板块 (用逗号分隔)"
              value={formData.sectors?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                sectors: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              fullWidth
              placeholder="例如: 银行, 软件, 生物医药"
            />

            <TextField
              label="资产组合 (格式: 代码,名称,仓位%,类型)"
              value={formData.assets?.map(asset => `${asset.symbol},${asset.name},${asset.position},${asset.type}`).join('; ') || ''}
              onChange={(e) => {
                const assets = e.target.value.split(';').map(item => {
                  const [symbol, name, position, type] = item.trim().split(',');
                  return {
                    symbol: symbol || '',
                    name: name || '',
                    position: Number(position) || 0,
                    type: (type?.trim() as 'long' | 'short') || 'long'
                  };
                }).filter(asset => asset.symbol);
                setFormData({ ...formData, assets });
              }}
              fullWidth
              multiline
              rows={2}
              placeholder="例如: AAPL,苹果公司,25,long; JPM,摩根大通,20,long"
            />

            <TextField
              label="备注"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="添加策略的详细说明和注意事项..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 风险详情对话框 */}
      <Dialog open={openRiskDialog} onClose={() => setOpenRiskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          风险详情 - {selectedRiskStrategy?.name}
        </DialogTitle>
        <DialogContent>
          {selectedRiskStrategy && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* 风险级别概览 */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  风险级别概览
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={riskLevelConfig[selectedRiskStrategy.riskLevel].icon}
                    label={riskLevelConfig[selectedRiskStrategy.riskLevel].label}
                    color={riskLevelConfig[selectedRiskStrategy.riskLevel].color}
                    size="medium"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {selectedRiskStrategy.riskLevel === 'low' && '该策略风险较低，适合保守型投资者'}
                    {selectedRiskStrategy.riskLevel === 'medium' && '该策略风险中等，适合平衡型投资者'}
                    {selectedRiskStrategy.riskLevel === 'high' && '该策略风险较高，适合激进型投资者'}
                  </Typography>
                </Box>
              </Paper>

              {/* 仓位风险分析 */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  仓位风险分析
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      最高做多价值
                    </Typography>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedRiskStrategy.maxLongValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      建议不超过总资产的30%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      最高做空价值
                    </Typography>
                    <Typography variant="h5" color="error.main" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedRiskStrategy.maxShortValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      建议不超过总资产的20%
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* 行业风险分析 */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  行业风险分析
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    涉及行业
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRiskStrategy.industries.map((industry, index) => (
                      <Chip key={index} label={industry} variant="outlined" />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    涉及板块
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRiskStrategy.sectors.map((sector, index) => (
                      <Chip key={index} label={sector} color="primary" />
                    ))}
                  </Box>
                </Box>
              </Paper>

              {/* 风险建议 */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  风险建议
                </Typography>
                <Alert severity={selectedRiskStrategy.riskLevel === 'high' ? 'warning' : selectedRiskStrategy.riskLevel === 'medium' ? 'info' : 'success'}>
                  {selectedRiskStrategy.riskLevel === 'low' && 
                    '该策略风险较低，建议长期持有，定期关注基本面变化。'
                  }
                  {selectedRiskStrategy.riskLevel === 'medium' && 
                    '该策略风险中等，建议适度分散投资，关注市场波动。'
                  }
                  {selectedRiskStrategy.riskLevel === 'high' && 
                    '该策略风险较高，建议严格控制仓位，设置止损点，密切关注市场动态。'
                  }
                </Alert>
              </Paper>

              {/* 备注信息 */}
              {selectedRiskStrategy.notes && (
                <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    策略备注
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRiskStrategy.notes}
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRiskDialog(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StrategyPage;
