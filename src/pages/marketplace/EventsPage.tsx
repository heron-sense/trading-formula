import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Stack,
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Avatar,
  Badge
} from '@mui/material';
import {
  Search,
  Event,
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
  ShowChart,
  CalendarToday,
  Business,
  AttachMoney,
  Public,
  Science,
  School,
  HealthAndSafety,
  LocalHospital,
  Factory,
  Agriculture,
  Computer,
  ShoppingCart,
  Flight,
  Home,
  Sports,
  Movie,
  Book,
  Gamepad,
  Pets,
  Nature,
  WbSunny,
  Cloud,
  AcUnit,
  FilterList,
  Refresh
} from '@mui/icons-material';

// 事件数据类型
interface MarketEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  affectedSectors: string[];
  source: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  priority: number;
  tags: string[];
  relatedStocks: string[];
  potentialImpact: string;
  lastUpdated: string;
}

// Mock数据
const mockEvents: MarketEvent[] = [
  {
    id: '1',
    title: '美联储利率决议',
    description: '美联储将公布最新的利率决策，可能影响全球金融市场',
    eventDate: '2024-01-31',
    eventTime: '14:00',
    category: '货币政策',
    impact: 'HIGH',
    impactType: 'NEUTRAL',
    affectedSectors: ['金融', '房地产', '科技'],
    source: '美联储',
    status: 'UPCOMING',
    priority: 9,
    tags: ['利率', '货币政策', '美联储'],
    relatedStocks: ['JPM', 'BAC', 'WFC'],
    potentialImpact: '可能影响股市波动，银行股和房地产股将受到直接影响',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    title: '苹果公司财报发布',
    description: '苹果公司将发布2024年第一季度财报',
    eventDate: '2024-02-01',
    eventTime: '16:30',
    category: '财报',
    impact: 'HIGH',
    impactType: 'NEUTRAL',
    affectedSectors: ['科技', '消费电子'],
    source: '苹果公司',
    status: 'UPCOMING',
    priority: 8,
    tags: ['财报', '苹果', '科技股'],
    relatedStocks: ['AAPL', 'TSM', 'QCOM'],
    potentialImpact: '财报结果将直接影响苹果股价，并可能影响整个科技板块',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '3',
    title: 'OPEC+会议',
    description: 'OPEC+将讨论石油产量政策',
    eventDate: '2024-02-05',
    eventTime: '10:00',
    category: '能源政策',
    impact: 'MEDIUM',
    impactType: 'NEUTRAL',
    affectedSectors: ['能源', '化工', '航空'],
    source: 'OPEC',
    status: 'UPCOMING',
    priority: 6,
    tags: ['石油', 'OPEC', '能源'],
    relatedStocks: ['XOM', 'CVX', 'COP'],
    potentialImpact: '产量决策将影响油价，进而影响能源股和相关行业',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '4',
    title: '中美贸易谈判',
    description: '中美两国将进行新一轮贸易谈判',
    eventDate: '2024-02-10',
    eventTime: '09:00',
    category: '贸易政策',
    impact: 'HIGH',
    impactType: 'POSITIVE',
    affectedSectors: ['科技', '制造业', '农业'],
    source: '商务部',
    status: 'UPCOMING',
    priority: 7,
    tags: ['贸易', '中美关系', '关税'],
    relatedStocks: ['AAPL', 'MSFT', 'GOOGL'],
    potentialImpact: '谈判结果可能影响科技股和制造业股票表现',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '5',
    title: '特斯拉自动驾驶技术更新',
    description: '特斯拉将发布最新的自动驾驶技术更新',
    eventDate: '2024-02-15',
    eventTime: '20:00',
    category: '技术创新',
    impact: 'MEDIUM',
    impactType: 'POSITIVE',
    affectedSectors: ['汽车', '科技'],
    source: '特斯拉',
    status: 'UPCOMING',
    priority: 5,
    tags: ['自动驾驶', '特斯拉', 'AI'],
    relatedStocks: ['TSLA', 'NVDA', 'AMD'],
    potentialImpact: '技术更新可能推动特斯拉股价上涨，并影响相关AI芯片股',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '6',
    title: '欧洲央行货币政策会议',
    description: '欧洲央行将讨论货币政策调整',
    eventDate: '2024-02-20',
    eventTime: '14:45',
    category: '货币政策',
    impact: 'MEDIUM',
    impactType: 'NEUTRAL',
    affectedSectors: ['金融', '房地产'],
    source: '欧洲央行',
    status: 'UPCOMING',
    priority: 6,
    tags: ['欧洲央行', '货币政策', '欧元'],
    relatedStocks: ['ASML', 'SAP', 'NVO'],
    potentialImpact: '政策调整将影响欧洲股市和欧元汇率',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '7',
    title: '英伟达AI芯片发布会',
    description: '英伟达将发布新一代AI芯片产品',
    eventDate: '2024-02-25',
    eventTime: '19:00',
    category: '产品发布',
    impact: 'HIGH',
    impactType: 'POSITIVE',
    affectedSectors: ['科技', 'AI', '半导体'],
    source: '英伟达',
    status: 'UPCOMING',
    priority: 8,
    tags: ['AI芯片', '英伟达', '半导体'],
    relatedStocks: ['NVDA', 'AMD', 'INTC'],
    potentialImpact: '新产品发布可能推动英伟达股价大幅上涨，并带动AI概念股',
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: '8',
    title: '全球气候变化峰会',
    description: '联合国气候变化大会将讨论全球气候政策',
    eventDate: '2024-03-01',
    eventTime: '09:00',
    category: '环境政策',
    impact: 'MEDIUM',
    impactType: 'POSITIVE',
    affectedSectors: ['新能源', '环保', '汽车'],
    source: '联合国',
    status: 'UPCOMING',
    priority: 5,
    tags: ['气候变化', '环保', '新能源'],
    relatedStocks: ['TSLA', 'NIO', 'PLUG'],
    potentialImpact: '气候政策可能推动新能源和电动汽车股票上涨',
    lastUpdated: '2024-01-15 10:30:00'
  }
];

const EventsPage: React.FC = () => {
  const [events] = useState<MarketEvent[]>(mockEvents);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [impactFilter, setImpactFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 过滤逻辑
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchKeyword) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (impactFilter) {
      filtered = filtered.filter(event => event.impact === impactFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // 按优先级和日期排序
    return filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // 优先级高的在前
      }
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });
  }, [events, searchKeyword, categoryFilter, impactFilter, statusFilter]);

  // 分页逻辑
  const paginatedEvents = filteredEvents.slice(
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

  // 处理事件详情查看
  const handleEventClick = (event: MarketEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  // 获取影响颜色
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'HIGH': return '#f44336';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#4caf50';
      default: return '#666';
    }
  };

  // 获取影响类型颜色
  const getImpactTypeColor = (impactType: string): string => {
    switch (impactType) {
      case 'POSITIVE': return '#4caf50';
      case 'NEGATIVE': return '#f44336';
      case 'NEUTRAL': return '#666';
      default: return '#666';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'UPCOMING': return '#2196f3';
      case 'ONGOING': return '#ff9800';
      case 'COMPLETED': return '#4caf50';
      default: return '#666';
    }
  };

  // 获取类别图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '货币政策': return <AttachMoney />;
      case '财报': return <Business />;
      case '能源政策': return <Factory />;
      case '贸易政策': return <Public />;
      case '技术创新': return <Science />;
      case '产品发布': return <ShowChart />;
      case '环境政策': return <Nature />;
      default: return <Event />;
    }
  };

  // 获取所有类别
  const categories = Array.from(new Set(events.map(e => e.category)));

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          市场事件
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          刷新数据
        </Button>
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
            label="搜索事件"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            placeholder="搜索事件标题、描述或标签"
          />
          <FormControl fullWidth>
            <InputLabel>事件类别</InputLabel>
            <Select
              value={categoryFilter}
              label="事件类别"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">全部类别</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>影响程度</InputLabel>
            <Select
              value={impactFilter}
              label="影响程度"
              onChange={(e) => setImpactFilter(e.target.value)}
            >
              <MenuItem value="">全部影响程度</MenuItem>
              <MenuItem value="HIGH">高影响</MenuItem>
              <MenuItem value="MEDIUM">中影响</MenuItem>
              <MenuItem value="LOW">低影响</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>事件状态</InputLabel>
            <Select
              value={statusFilter}
              label="事件状态"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">全部状态</MenuItem>
              <MenuItem value="UPCOMING">即将发生</MenuItem>
              <MenuItem value="ONGOING">进行中</MenuItem>
              <MenuItem value="COMPLETED">已完成</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 统计信息 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          显示 {filteredEvents.length} 个市场事件
        </Typography>
      </Box>

      {/* 事件列表 */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <List>
          {paginatedEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleEventClick(event)}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      backgroundColor: getImpactColor(event.impact),
                      color: 'white'
                    }}
                  >
                    {getCategoryIcon(event.category)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.impact === 'HIGH' ? '高影响' : event.impact === 'MEDIUM' ? '中影响' : '低影响'}
                        size="small"
                        sx={{
                          backgroundColor: getImpactColor(event.impact),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Chip
                        label={event.status === 'UPCOMING' ? '即将发生' : event.status === 'ONGOING' ? '进行中' : '已完成'}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: getStatusColor(event.status),
                          color: getStatusColor(event.status),
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {event.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(event.eventDate)} {event.eventTime}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.category}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.source}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {event.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {event.tags.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{event.tags.length - 3} 更多
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  查看详情
                </Button>
              </ListItem>
              {index < paginatedEvents.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* 分页 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredEvents.length}
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
      {filteredEvents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info">
            {searchKeyword || categoryFilter || impactFilter || statusFilter
              ? '没有找到符合条件的事件。'
              : '暂无市场事件数据。'
            }
          </Alert>
        </Box>
      )}

      {/* 事件详情弹窗 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event color="primary" />
            <Typography variant="h6">
              {selectedEvent?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Stack spacing={3}>
                {/* 基本信息 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      基本信息
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          事件时间
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(selectedEvent.eventDate)} {selectedEvent.eventTime}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          事件类别
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedEvent.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          影响程度
                        </Typography>
                        <Chip
                          label={selectedEvent.impact === 'HIGH' ? '高影响' : selectedEvent.impact === 'MEDIUM' ? '中影响' : '低影响'}
                          size="small"
                          sx={{
                            backgroundColor: getImpactColor(selectedEvent.impact),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          事件状态
                        </Typography>
                        <Chip
                          label={selectedEvent.status === 'UPCOMING' ? '即将发生' : selectedEvent.status === 'ONGOING' ? '进行中' : '已完成'}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: getStatusColor(selectedEvent.status),
                            color: getStatusColor(selectedEvent.status),
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          信息来源
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedEvent.source}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          优先级
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedEvent.priority}/10
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* 事件描述 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      事件描述
                    </Typography>
                    <Typography variant="body1">
                      {selectedEvent.description}
                    </Typography>
                  </CardContent>
                </Card>

                {/* 潜在影响 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      潜在影响
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedEvent.potentialImpact}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        受影响行业：
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedEvent.affectedSectors.map((sector, index) => (
                          <Chip
                            key={index}
                            label={sector}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        相关股票：
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedEvent.relatedStocks.map((stock, index) => (
                          <Chip
                            key={index}
                            label={stock}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        标签：
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedEvent.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* 更新时间 */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    最后更新：{selectedEvent.lastUpdated}
                  </Typography>
                </Box>
              </Stack>
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

export default EventsPage;
