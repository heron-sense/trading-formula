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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Email,
  Phone,
  LocationOn,
  Business,
  Person
} from '@mui/icons-material';

// 客户数据类型
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
}

// 模拟客户数据
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '138-0000-0001',
    company: '阿里巴巴集团',
    status: 'active',
    location: '杭州市',
    registrationDate: '2024-01-15',
    lastContact: '2024-12-20',
    avatar: undefined
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '138-0000-0002',
    company: '腾讯科技',
    status: 'active',
    location: '深圳市',
    registrationDate: '2024-02-20',
    lastContact: '2024-12-18',
    avatar: undefined
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '138-0000-0003',
    company: '百度公司',
    status: 'pending',
    location: '北京市',
    registrationDate: '2024-03-10',
    lastContact: '2024-12-15',
    avatar: undefined
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '138-0000-0004',
    company: '字节跳动',
    status: 'inactive',
    location: '北京市',
    registrationDate: '2024-01-05',
    lastContact: '2024-11-30',
    avatar: undefined
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '138-0000-0005',
    company: '美团',
    status: 'active',
    location: '北京市',
    registrationDate: '2024-04-12',
    lastContact: '2024-12-19',
    avatar: undefined
  },
  {
    id: '6',
    name: '孙八',
    email: 'sunba@example.com',
    phone: '138-0000-0006',
    company: '滴滴出行',
    status: 'active',
    location: '北京市',
    registrationDate: '2024-05-08',
    lastContact: '2024-12-17',
    avatar: undefined
  },
  {
    id: '7',
    name: '周九',
    email: 'zhoujiu@example.com',
    phone: '138-0000-0007',
    company: '京东集团',
    status: 'pending',
    location: '北京市',
    registrationDate: '2024-06-15',
    lastContact: '2024-12-10',
    avatar: undefined
  },
  {
    id: '8',
    name: '吴十',
    email: 'wushi@example.com',
    phone: '138-0000-0008',
    company: '小米科技',
    status: 'active',
    location: '北京市',
    registrationDate: '2024-07-20',
    lastContact: '2024-12-16',
    avatar: undefined
  }
];

const CustomerListPage: React.FC = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  // 搜索功能
  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
    setPage(0); // 重置到第一页
  }, [searchTerm, customers]);

  // 分页处理
  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 查看客户详情
  const handleViewCustomer = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
  };

  // 获取状态颜色
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'success';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'pending':
        return '待处理';
      case 'inactive':
        return '非活跃';
      default:
        return '未知';
    }
  };

  // 分页数据
  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 页面标题和操作栏 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, mx: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            客户管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
          >
            新增客户
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          管理您的客户信息，包括联系方式、公司信息和状态跟踪
        </Typography>

        {/* 搜索栏 */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="搜索客户姓名、邮箱、公司或电话..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Paper>

      {/* 统计卡片 */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 3,
        mx: 2
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {customers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总客户数
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {customers.filter(c => c.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  活跃客户
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <Email />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {customers.filter(c => c.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  待处理
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <Phone />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {customers.filter(c => c.status === 'inactive').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  非活跃
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 客户列表表格 */}
      <Paper elevation={2} sx={{ borderRadius: 2, mx: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>客户信息</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>联系方式</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>公司</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>注册日期</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>最后联系</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {customer.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customer.company}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {customer.location}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(customer.status)}
                      color={getStatusColor(customer.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(customer.registrationDate).toLocaleDateString('zh-CN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(customer.lastContact).toLocaleDateString('zh-CN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        sx={{ color: 'primary.main' }}
                        title="查看详情"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: 'warning.main' }}
                        title="编辑"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: 'error.main' }}
                        title="删除"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 分页组件 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => 
            `第 ${from}-${to} 条，共 ${count} 条`
          }
        />
      </Paper>

      {/* 客户详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {selectedCustomer?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCustomer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                客户详情
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    基本信息
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">姓名</Typography>
                    <Typography variant="body1">{selectedCustomer.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">公司</Typography>
                    <Typography variant="body1">{selectedCustomer.company}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">状态</Typography>
                    <Chip
                      label={getStatusText(selectedCustomer.status)}
                      color={getStatusColor(selectedCustomer.status)}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    联系信息
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">邮箱</Typography>
                    <Typography variant="body1">{selectedCustomer.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">电话</Typography>
                    <Typography variant="body1">{selectedCustomer.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">地址</Typography>
                    <Typography variant="body1">{selectedCustomer.location}</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                gap: 3 
              }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    时间信息
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">注册日期</Typography>
                    <Typography variant="body1">
                      {new Date(selectedCustomer.registrationDate).toLocaleDateString('zh-CN')}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">最后联系</Typography>
                    <Typography variant="body1">
                      {new Date(selectedCustomer.lastContact).toLocaleDateString('zh-CN')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            关闭
          </Button>
          <Button variant="contained" startIcon={<Edit />}>
            编辑客户
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerListPage;
