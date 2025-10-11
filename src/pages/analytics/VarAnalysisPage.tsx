import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Info,
  Assessment,
  ShowChart,
  Timeline,
  Security,
  Psychology,
  AttachMoney,
  Refresh,
  Download,
  Share,
  Print,
  Tune,
  Adjust,
  Speed,
  BarChart,
  ExpandMore,
  Settings
} from '@mui/icons-material';

// VaR分析数据类型
interface VaRAnalysis {
  id: string;
  symbol: string;
  name: string;
  confidenceLevel: number;
  timeHorizon: number;
  varValue: number;
  varPercent: number;
  expectedShortfall: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  beta: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
  analysisDate: string;
  historicalData: {
    date: string;
    price: number;
    return: number;
  }[];
  scenarioAnalysis: {
    scenario: string;
    probability: number;
    impact: number;
    description: string;
  }[];
  riskFactors: {
    factor: string;
    impact: number;
    description: string;
  }[];
}

// Mock数据生成函数
const generateVaRAnalysis = (symbol: string, name: string, position?: number, type?: string): VaRAnalysis => {
  const baseVar = Math.random() * 0.15 + 0.05; // 5-20%的VaR
  const volatility = Math.random() * 0.4 + 0.1; // 10-50%的波动率
  
  // 根据仓位比例调整VaR计算
  const positionMultiplier = position ? position / 100 : 1; // 仓位比例影响
  const adjustedVar = baseVar * positionMultiplier;
  
  // 根据做多/做空调整风险
  const typeMultiplier = type === 'short' ? 1.2 : 1.0; // 做空风险更高
  const finalVar = adjustedVar * typeMultiplier;
  
  return {
    id: `var_${symbol}_${Date.now()}`,
    symbol,
    name,
    confidenceLevel: 95,
    timeHorizon: 1,
    varValue: finalVar * 100000, // 基于10万投资组合
    varPercent: finalVar * 100,
    expectedShortfall: finalVar * 1.2 * 100000,
    maxDrawdown: finalVar * 1.5 * 100,
    sharpeRatio: Math.random() * 2 + 0.5,
    volatility: volatility * 100,
    beta: Math.random() * 2 + 0.5,
    riskLevel: finalVar > 0.15 ? 'VERY_HIGH' : finalVar > 0.10 ? 'HIGH' : finalVar > 0.05 ? 'MEDIUM' : 'LOW',
    recommendation: finalVar > 0.15 ? 'AVOID' : finalVar > 0.10 ? 'SELL' : finalVar > 0.05 ? 'HOLD' : 'BUY',
    analysisDate: new Date().toISOString().split('T')[0],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 100 + Math.random() * 50 - 25,
      return: (Math.random() - 0.5) * 0.1
    })),
    scenarioAnalysis: [
      {
        scenario: '最佳情况',
        probability: 20,
        impact: 15,
        description: '市场利好，股价上涨15%'
      },
      {
        scenario: '基准情况',
        probability: 60,
        impact: 0,
        description: '市场平稳，股价基本不变'
      },
      {
        scenario: '最坏情况',
        probability: 20,
        impact: -baseVar * 100,
        description: `市场不利，股价下跌${(baseVar * 100).toFixed(1)}%`
      }
    ],
    riskFactors: [
      {
        factor: '市场风险',
        impact: 0.4,
        description: '整体市场波动对股价的影响'
      },
      {
        factor: '行业风险',
        impact: 0.3,
        description: '所属行业特定风险'
      },
      {
        factor: '公司风险',
        impact: 0.2,
        description: '公司内部经营风险'
      },
      {
        factor: '流动性风险',
        impact: 0.1,
        description: '股票交易流动性风险'
      }
    ]
  };
};

// 变量控制参数类型
interface VarControls {
  confidenceLevel: number;
  timeHorizon: number;
  portfolioValue: number;
  volatility: number;
  correlation: number;
  marketStress: number;
  liquidityRisk: number;
  concentrationRisk: number;
}

const VarAnalysisPage: React.FC = () => {
  const [varAnalysis, setVarAnalysis] = useState<VaRAnalysis | null>(null);
  const [strategyAnalysis, setStrategyAnalysis] = useState<VaRAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isStrategyMode, setIsStrategyMode] = useState(false);
  
  // 变量控制状态
  const [controls, setControls] = useState<VarControls>({
    confidenceLevel: 95,
    timeHorizon: 1,
    portfolioValue: 100000,
    volatility: 0.2,
    correlation: 0.3,
    marketStress: 0.1,
    liquidityRisk: 0.05,
    concentrationRisk: 0.15
  });
  
  // 控制面板展开状态
  const [controlsExpanded, setControlsExpanded] = useState(false);

  useEffect(() => {
    // 从URL参数获取股票信息
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    const name = urlParams.get('name') || '';
    const strategy = urlParams.get('strategy');
    const assets = urlParams.get('assets');
    const assetsData = urlParams.get('assetsData');

    console.log('VAR分析页面URL参数:', {
      symbol,
      name,
      strategy,
      assets,
      assetsData: assetsData ? '有数据' : '无数据'
    });

    if (symbol) {
      // 单个股票分析
      setIsStrategyMode(false);
      setTimeout(() => {
        setVarAnalysis(generateVaRAnalysis(symbol, name));
        setLoading(false);
      }, 1000);
    } else if (strategy && assetsData) {
      // 策略分析 - 解析完整的资产信息
      setIsStrategyMode(true);
      try {
        const parsedAssets = JSON.parse(decodeURIComponent(assetsData));
        console.log('解析的资产数据:', parsedAssets);
        setTimeout(() => {
          const analyses = parsedAssets.map((asset: any, index: number) => 
            generateVaRAnalysis(asset.symbol, asset.name, asset.position, asset.type)
          );
          console.log('生成的分析数据:', analyses);
          setStrategyAnalysis(analyses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('解析资产数据失败:', error);
        setError('解析策略资产数据失败');
        setLoading(false);
      }
    } else if (strategy && assets) {
      // 兼容旧版本 - 只有symbol列表
      setIsStrategyMode(true);
      const assetSymbols = assets.split(',');
      setTimeout(() => {
        const analyses = assetSymbols.map((assetSymbol, index) => 
          generateVaRAnalysis(assetSymbol.trim(), `策略资产 ${index + 1}`)
        );
        setStrategyAnalysis(analyses);
        setLoading(false);
      }, 1000);
    } else {
      setError('缺少必要的分析参数');
      setLoading(false);
    }
  }, []);

  // 获取风险等级颜色
  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'LOW': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#f44336';
      case 'VERY_HIGH': return '#9c27b0';
      default: return '#666';
    }
  };

  // 获取风险等级标签
  const getRiskLevelLabel = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'LOW': return '低风险';
      case 'MEDIUM': return '中风险';
      case 'HIGH': return '高风险';
      case 'VERY_HIGH': return '极高风险';
      default: return '未知';
    }
  };

  // 获取推荐颜色
  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'BUY': return '#4caf50';
      case 'HOLD': return '#ff9800';
      case 'SELL': return '#f44336';
      case 'AVOID': return '#9c27b0';
      default: return '#666';
    }
  };

  // 获取推荐标签
  const getRecommendationLabel = (recommendation: string): string => {
    switch (recommendation) {
      case 'BUY': return '买入';
      case 'HOLD': return '持有';
      case 'SELL': return '卖出';
      case 'AVOID': return '避免';
      default: return '未知';
    }
  };

  // 格式化货币
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // 格式化百分比
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // 处理变量控制变化
  const handleControlChange = (key: keyof VarControls, value: number) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 重新计算VaR分析
  const recalculateVaR = () => {
    if (isStrategyMode) {
      // 策略模式：重新计算所有资产
      setStrategyAnalysis(prev => prev.map(analysis => {
        const newVarPercent = controls.volatility * Math.sqrt(controls.timeHorizon) * 
          (1 + controls.marketStress + controls.liquidityRisk + controls.concentrationRisk);
        
        const newVarValue = controls.portfolioValue * newVarPercent;
        const newExpectedShortfall = newVarValue * 1.2;
        const newMaxDrawdown = newVarPercent * 1.5 * 100;
        
        return {
          ...analysis,
          confidenceLevel: controls.confidenceLevel,
          timeHorizon: controls.timeHorizon,
          varValue: newVarValue,
          varPercent: newVarPercent * 100,
          expectedShortfall: newExpectedShortfall,
          maxDrawdown: newMaxDrawdown,
          volatility: controls.volatility * 100,
          riskLevel: newVarPercent > 0.15 ? 'VERY_HIGH' : newVarPercent > 0.10 ? 'HIGH' : newVarPercent > 0.05 ? 'MEDIUM' : 'LOW',
          recommendation: newVarPercent > 0.15 ? 'AVOID' : newVarPercent > 0.10 ? 'SELL' : newVarPercent > 0.05 ? 'HOLD' : 'BUY'
        };
      }));
    } else {
      // 单个股票模式
      if (!varAnalysis) return;
      
      const newVarPercent = controls.volatility * Math.sqrt(controls.timeHorizon) * 
        (1 + controls.marketStress + controls.liquidityRisk + controls.concentrationRisk);
      
      const newVarValue = controls.portfolioValue * newVarPercent;
      const newExpectedShortfall = newVarValue * 1.2;
      const newMaxDrawdown = newVarPercent * 1.5 * 100;
      
      setVarAnalysis(prev => prev ? {
        ...prev,
        confidenceLevel: controls.confidenceLevel,
        timeHorizon: controls.timeHorizon,
        varValue: newVarValue,
        varPercent: newVarPercent * 100,
        expectedShortfall: newExpectedShortfall,
        maxDrawdown: newMaxDrawdown,
        volatility: controls.volatility * 100,
        riskLevel: newVarPercent > 0.15 ? 'VERY_HIGH' : newVarPercent > 0.10 ? 'HIGH' : newVarPercent > 0.05 ? 'MEDIUM' : 'LOW',
        recommendation: newVarPercent > 0.15 ? 'AVOID' : newVarPercent > 0.10 ? 'SELL' : newVarPercent > 0.05 ? 'HOLD' : 'BUY'
      } : null);
    }
  };

  // 重置控制参数
  const resetControls = () => {
    setControls({
      confidenceLevel: 95,
      timeHorizon: 1,
      portfolioValue: 100000,
      volatility: 0.2,
      correlation: 0.3,
      marketStress: 0.1,
      liquidityRisk: 0.05,
      concentrationRisk: 0.15
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          正在分析VaR数据...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!isStrategyMode && !varAnalysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">未找到分析数据</Alert>
      </Box>
    );
  }

  if (isStrategyMode && strategyAnalysis.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">未找到策略分析数据</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面标题和操作 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            VaR风险分析报告
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isStrategyMode 
              ? `投资策略分析 (${strategyAnalysis.length}个资产)`
              : varAnalysis ? `${varAnalysis.name} (${varAnalysis.symbol})` : '分析数据'
            }
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setControlsExpanded(!controlsExpanded)}
            color={controlsExpanded ? 'primary' : 'inherit'}
          >
            变量控制
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            刷新
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => console.log('下载报告')}
          >
            下载
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => console.log('分享报告')}
          >
            分享
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            打印
          </Button>
        </Stack>
      </Box>

      {/* 变量控制面板 */}
      {controlsExpanded && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings />
                变量控制面板
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetControls}
                >
                  重置
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={recalculateVaR}
                >
                  重新计算
                </Button>
              </Stack>
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
              gap: 3 
            }}>
              {/* 置信水平 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  置信水平: {controls.confidenceLevel}%
                </Typography>
                <Slider
                  value={controls.confidenceLevel}
                  onChange={(_, value) => handleControlChange('confidenceLevel', value as number)}
                  min={90}
                  max={99}
                  step={1}
                  marks={[
                    { value: 90, label: '90%' },
                    { value: 95, label: '95%' },
                    { value: 99, label: '99%' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* 时间周期 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  时间周期: {controls.timeHorizon}天
                </Typography>
                <Slider
                  value={controls.timeHorizon}
                  onChange={(_, value) => handleControlChange('timeHorizon', value as number)}
                  min={1}
                  max={30}
                  step={1}
                  marks={[
                    { value: 1, label: '1天' },
                    { value: 7, label: '7天' },
                    { value: 30, label: '30天' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* 投资组合价值 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  投资组合价值: {formatCurrency(controls.portfolioValue)}
                </Typography>
                <Slider
                  value={controls.portfolioValue}
                  onChange={(_, value) => handleControlChange('portfolioValue', value as number)}
                  min={10000}
                  max={1000000}
                  step={10000}
                  marks={[
                    { value: 10000, label: '1万' },
                    { value: 100000, label: '10万' },
                    { value: 1000000, label: '100万' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatCurrency(value)}
                />
              </Box>

              {/* 波动率 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  波动率: {(controls.volatility * 100).toFixed(1)}%
                </Typography>
                <Slider
                  value={controls.volatility}
                  onChange={(_, value) => handleControlChange('volatility', value as number)}
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  marks={[
                    { value: 0.05, label: '5%' },
                    { value: 0.2, label: '20%' },
                    { value: 0.5, label: '50%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </Box>

              {/* 相关性 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  资产相关性: {(controls.correlation * 100).toFixed(1)}%
                </Typography>
                <Slider
                  value={controls.correlation}
                  onChange={(_, value) => handleControlChange('correlation', value as number)}
                  min={0}
                  max={1}
                  step={0.05}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.5, label: '50%' },
                    { value: 1, label: '100%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </Box>

              {/* 市场压力 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  市场压力: {(controls.marketStress * 100).toFixed(1)}%
                </Typography>
                <Slider
                  value={controls.marketStress}
                  onChange={(_, value) => handleControlChange('marketStress', value as number)}
                  min={0}
                  max={0.3}
                  step={0.01}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.1, label: '10%' },
                    { value: 0.3, label: '30%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </Box>

              {/* 流动性风险 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  流动性风险: {(controls.liquidityRisk * 100).toFixed(1)}%
                </Typography>
                <Slider
                  value={controls.liquidityRisk}
                  onChange={(_, value) => handleControlChange('liquidityRisk', value as number)}
                  min={0}
                  max={0.2}
                  step={0.01}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.05, label: '5%' },
                    { value: 0.2, label: '20%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </Box>

              {/* 集中度风险 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  集中度风险: {(controls.concentrationRisk * 100).toFixed(1)}%
                </Typography>
                <Slider
                  value={controls.concentrationRisk}
                  onChange={(_, value) => handleControlChange('concentrationRisk', value as number)}
                  min={0}
                  max={0.5}
                  step={0.01}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.15, label: '15%' },
                    { value: 0.5, label: '50%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}


      {/* 策略模式：汇总指标概览 */}
      {isStrategyMode && strategyAnalysis.length > 0 && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
          gap: 3, 
          mb: 3 
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">组合VaR</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {formatCurrency(strategyAnalysis.reduce((sum, analysis) => sum + analysis.varValue, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有资产VaR总和
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">组合预期损失</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {formatCurrency(strategyAnalysis.reduce((sum, analysis) => sum + analysis.expectedShortfall, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有资产预期损失总和
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">最大回撤</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {Math.max(...strategyAnalysis.map(a => a.maxDrawdown)).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有资产中最大回撤
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChart color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">平均夏普比率</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {(strategyAnalysis.reduce((sum, analysis) => sum + analysis.sharpeRatio, 0) / strategyAnalysis.length).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有资产夏普比率平均值
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 关键指标概览 */}
      {!isStrategyMode && varAnalysis && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
          gap: 3, 
          mb: 3 
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">VaR (95%)</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {varAnalysis ? formatCurrency(varAnalysis.varValue) : '$0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {varAnalysis ? `${varAnalysis.varPercent.toFixed(2)}% 的投资价值` : '0% 的投资价值'}
              </Typography>
            </CardContent>
          </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">预期损失</Typography>
            </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {varAnalysis ? formatCurrency(varAnalysis.expectedShortfall) : '$0'}
              </Typography>
            <Typography variant="body2" color="text.secondary">
              超过VaR的预期损失
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDown color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">最大回撤</Typography>
            </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {varAnalysis ? `${varAnalysis.maxDrawdown.toFixed(2)}%` : '0%'}
              </Typography>
            <Typography variant="body2" color="text.secondary">
              历史最大回撤幅度
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ShowChart color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">夏普比率</Typography>
            </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {varAnalysis ? varAnalysis.sharpeRatio.toFixed(2) : '0.00'}
              </Typography>
            <Typography variant="body2" color="text.secondary">
              风险调整后收益
            </Typography>
          </CardContent>
        </Card>
      </Box>
      )}

      {/* 风险评级和建议 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              风险评级
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={varAnalysis ? getRiskLevelLabel(varAnalysis.riskLevel) : '未知'}
                sx={{
                  backgroundColor: varAnalysis ? getRiskLevelColor(varAnalysis.riskLevel) : '#ccc',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                基于VaR分析的风险评估
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={varAnalysis ? varAnalysis.varPercent * 5 : 0} // 转换为0-100的进度条
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: varAnalysis ? getRiskLevelColor(varAnalysis.riskLevel) : '#ccc'
                }
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              投资建议
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={varAnalysis ? getRecommendationLabel(varAnalysis.recommendation) : '未知'}
                sx={{
                  backgroundColor: varAnalysis ? getRecommendationColor(varAnalysis.recommendation) : '#ccc',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                基于风险分析的推荐
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {varAnalysis && varAnalysis.recommendation === 'BUY' && '风险较低，建议买入'}
              {varAnalysis && varAnalysis.recommendation === 'HOLD' && '风险适中，建议持有'}
              {varAnalysis && varAnalysis.recommendation === 'SELL' && '风险较高，建议卖出'}
              {varAnalysis && varAnalysis.recommendation === 'AVOID' && '风险极高，建议避免'}
              {!varAnalysis && '暂无分析数据'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 详细分析 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 3 
      }}>
        {/* 风险指标详情 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              风险指标详情
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="置信水平"
                  secondary={varAnalysis ? `${varAnalysis.confidenceLevel}%` : '0%'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="时间周期"
                  secondary={varAnalysis ? `${varAnalysis.timeHorizon}天` : '0天'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="波动率"
                  secondary={varAnalysis ? `${varAnalysis.volatility.toFixed(2)}%` : '0%'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Beta系数"
                  secondary={varAnalysis ? varAnalysis.beta.toFixed(2) : '0.00'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="分析日期"
                  secondary={varAnalysis ? varAnalysis.analysisDate : '未知'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* 情景分析 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              情景分析
            </Typography>
            {varAnalysis && varAnalysis.scenarioAnalysis.map((scenario, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {scenario.scenario}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {scenario.probability}%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: scenario.impact >= 0 ? 'success.main' : 'error.main' }}
                    >
                      {formatPercent(scenario.impact)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {scenario.description}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={scenario.probability}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* 风险因子分析 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            风险因子分析
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>风险因子</TableCell>
                  <TableCell align="right">影响程度</TableCell>
                  <TableCell>描述</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {varAnalysis?.riskFactors.map((factor, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {factor.factor}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography variant="body2">
                          {(factor.impact * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={factor.impact * 100}
                          sx={{ width: 60, height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {factor.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 策略模式：多个资产分析 - 放在页面最下方 */}
      {isStrategyMode && strategyAnalysis.length > 0 && (
        <Box sx={{ mb: 3, mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            策略资产分析
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
            gap: 3 
          }}>
            {strategyAnalysis.map((analysis, index) => (
              <Card key={analysis.id} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {analysis.symbol}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={getRiskLevelLabel(analysis.riskLevel)}
                      size="small"
                      sx={{
                        backgroundColor: getRiskLevelColor(analysis.riskLevel),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        VaR (95%)
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatCurrency(analysis.varValue)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        预期损失
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        {formatCurrency(analysis.expectedShortfall)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        最大回撤
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {analysis.maxDrawdown.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        夏普比率
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {analysis.sharpeRatio.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={getRecommendationLabel(analysis.recommendation)}
                      size="small"
                      sx={{
                        backgroundColor: getRecommendationColor(analysis.recommendation),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      波动率: {analysis.volatility.toFixed(2)}%
                    </Typography>
                  </Box>
                  
                  {/* 仓位信息 */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 1
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      仓位: {Math.round((analysis.varPercent / 100) * 100)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      类型: {analysis.varPercent > 0 ? '做多' : '做空'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VarAnalysisPage;
