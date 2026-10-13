import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Badge,
  Business,
  Email,
  Person,
  Phone,
  Refresh,
  Search,
  Visibility,
  Work,
} from '@mui/icons-material';
import type { Employee } from '../../models';
import { fetchEmployees } from '../../data/employeeApi';

const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEmployees({
        page: page + 1,
        pageSize: rowsPerPage,
        keyword,
      });
      setEmployees(result.items);
      setTotal(result.total);
      setCompanyId(result.companyId);
      setActiveCount(result.activeCount);
      setPendingCount(result.pendingCount);
      setInactiveCount(result.inactiveCount);
    } catch (err) {
      setEmployees([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : '加载员工列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

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
        return '在职';
      case 'pending':
        return '待入职';
      case 'inactive':
        return '离职';
      default:
        return '未知';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, mx: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              员工管理
            </Typography>
            {companyId && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                本公司 ID：{companyId}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadEmployees()}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            刷新
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          展示当前登录账号所属公司的员工列表
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setKeyword(searchTerm.trim());
          }}
          sx={{ display: 'flex', gap: 1, maxWidth: 700 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜索姓名、邮箱、电话、职位或部门..."
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
                <Typography variant="h6">{activeCount + pendingCount + inactiveCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  本公司员工
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <Badge />
              </Avatar>
              <Box>
                <Typography variant="h6">{activeCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  在职
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <Work />
              </Avatar>
              <Box>
                <Typography variant="h6">{pendingCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  待入职
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6">{inactiveCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  离职
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={2}
        sx={{ borderRadius: 2, mx: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => loadEmployees()}>
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
                <TableCell sx={{ fontWeight: 600 }}>员工</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>联系方式</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>职位 / 部门</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>入职日期</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无员工数据</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {emp.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{emp.email || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{emp.phone || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {emp.title || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {emp.department || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(emp.status)}
                        color={getStatusColor(emp.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {emp.hiredAt
                          ? new Date(emp.hiredAt).toLocaleDateString('zh-CN')
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        title="查看详情"
                        onClick={() => {
                          setSelected(emp);
                          setDetailOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
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
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to} 条，共 ${count} 条`}
        />
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{selected?.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="h6">{selected?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                员工详情
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                职位
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.title || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                部门
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.department || '-'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                邮箱
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.email || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                电话
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.phone || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                状态
              </Typography>
              <Chip
                label={getStatusText(selected.status)}
                color={getStatusColor(selected.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeListPage;
