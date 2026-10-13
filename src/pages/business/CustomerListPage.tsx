import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  CircularProgress,
  Alert,
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
  Person,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '../../models';
import { fetchCustomers } from '../../data/customerApi';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCustomers({
        page: page + 1,
        pageSize: rowsPerPage,
        keyword,
      });
      setCustomers(result.items);
      setTotal(result.total);
      setActiveCount(result.activeCount);
      setPendingCount(result.pendingCount);
      setInactiveCount(result.inactiveCount);
    } catch (err) {
      setCustomers([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : '加载客户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    setKeyword(searchTerm.trim());
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCustomer = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
  };

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

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, mx: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            客户管理
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadCustomers()}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              刷新
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
              onClick={() => navigate('/business/customers/import')}
            >
              新增客户
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          管理您的客户信息，包括联系方式、公司信息和状态跟踪
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: 'flex', gap: 1, maxWidth: 700 }}
        >
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
          />
          <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
            搜索
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 3,
          mx: 2,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {activeCount + pendingCount + inactiveCount}
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
                  {activeCount}
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
                  {pendingCount}
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
                  {inactiveCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  非活跃
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          mx: 2,
          mb: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => loadCustomers()}>
                重试
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <TableContainer sx={{ flexGrow: 1, position: 'relative', minHeight: 240 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.6)',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
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
              {!loading && customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无客户数据</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
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
                        {customer.registrationDate
                          ? new Date(customer.registrationDate).toLocaleDateString('zh-CN')
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.lastContact
                          ? new Date(customer.lastContact).toLocaleDateString('zh-CN')
                          : '-'}
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
                        <IconButton size="small" sx={{ color: 'warning.main' }} title="编辑">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'error.main' }} title="删除">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to} 条，共 ${count} 条`}
        />
      </Paper>

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
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    基本信息
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      姓名
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      公司
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.company}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      状态
                    </Typography>
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
                    <Typography variant="body2" color="text.secondary">
                      邮箱
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      电话
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      地址
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.location}</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    时间信息
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      注册日期
                    </Typography>
                    <Typography variant="body1">
                      {selectedCustomer.registrationDate
                        ? new Date(selectedCustomer.registrationDate).toLocaleDateString('zh-CN')
                        : '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      最后联系
                    </Typography>
                    <Typography variant="body1">
                      {selectedCustomer.lastContact
                        ? new Date(selectedCustomer.lastContact).toLocaleDateString('zh-CN')
                        : '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          <Button variant="contained" startIcon={<Edit />}>
            编辑客户
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerListPage;
