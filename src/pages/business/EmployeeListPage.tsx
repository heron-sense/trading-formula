import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
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
import { Email, Refresh, Search, Visibility } from '@mui/icons-material';
import { getSessionCliAbbr } from '../../auth/session';
import {
  EdDSAUser,
  fetchUsersByCliAbbr,
  isUserEnabled,
} from '../../data/employeeApi';

const EmployeeListPage: React.FC = () => {
  const cliAbbr = getSessionCliAbbr();
  const [users, setUsers] = useState<EdDSAUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EdDSAUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    const abbr = getSessionCliAbbr();
    if (!abbr) {
      setUsers([]);
      setError('登录会话缺少 cli_abbr，请重新登录');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUsersByCliAbbr(abbr);
      setUsers(list);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : '加载员工列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [u.id, u.name, u.cli_abbr, u.email_addr, u.enabled]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, keyword]);

  const total = filtered.length;
  const pageUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, mx: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              员工管理
            </Typography>
            {cliAbbr && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                客户简称：{cliAbbr}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void loadUsers()}
            disabled={loading || !cliAbbr}
            sx={{ borderRadius: 2 }}
          >
            刷新
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          展示当前登录账号所属客户的用户列表
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
            placeholder="筛选姓名、邮箱、ID..."
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
            筛选
          </Button>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{ borderRadius: 2, mx: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => void loadUsers()}>
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
                <TableCell sx={{ fontWeight: 600 }}>用户</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>邮箱</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>客户简称</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && pageUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无用户数据</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageUsers.map((user) => {
                  const enabled = isUserEnabled(user.enabled);
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {(user.name || '?').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.name || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.email_addr || '-'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.cli_abbr || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={enabled ? '启用' : '禁用'}
                          color={enabled ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          title="查看详情"
                          onClick={() => {
                            setSelected(user);
                            setDetailOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
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
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {(selected?.name || '?').charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selected?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                用户详情
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.id || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                客户简称
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.cli_abbr || '-'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                邮箱
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selected.email_addr || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                状态
              </Typography>
              <Chip
                label={isUserEnabled(selected.enabled) ? '启用' : '禁用'}
                color={isUserEnabled(selected.enabled) ? 'success' : 'default'}
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
