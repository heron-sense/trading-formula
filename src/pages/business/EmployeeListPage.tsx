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
import { Edit, Email, Refresh, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSessionCliAbbr } from '../../auth/session';
import {
  assignEdDSAUserRole,
  EdDSARole,
  EdDSAUser,
  fetchEdDSARoles,
  fetchEdDSAUserList,
  mergeEdDSARoles,
  resolveRoleNames,
} from '../../data/employeeApi';

const ROLE_RULER_COLORS = [
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#1976d2',
  '#7b1fa2',
  '#00838f',
  '#5d4037',
  '#455a64',
] as const;

const UNASSIGNED_ROLE_COLOR = '#607d8b';

const roleChipSx = (color: string) => ({
  maxWidth: 140,
  height: 24,
  borderColor: color,
  color,
  bgcolor: `${color}14`,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    px: 1,
  },
});

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const cliAbbr = getSessionCliAbbr();
  const [users, setUsers] = useState<EdDSAUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<EdDSARole[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [assignUser, setAssignUser] = useState<EdDSAUser | null>(null);
  const [pickedRoleId, setPickedRoleId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { users: list, roles: embedded } = await fetchEdDSAUserList(abbr);
      setUsers(list);
      setRoles((prev) => mergeEdDSARoles(embedded, prev));
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : '加载员工列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const list = await fetchEdDSARoles();
      setRoles((prev) => mergeEdDSARoles(list, prev));
      setRolesError(null);
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : '加载角色失败');
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const roleNamesByUserId = useMemo(() => {
    const next: Record<string, string[]> = {};
    for (const user of users) {
      next[user.id] = resolveRoleNames(user.roleIds, roles);
    }
    return next;
  }, [users, roles]);

  const roleNamesOf = useCallback(
    (userId: string) => roleNamesByUserId[userId] ?? [],
    [roleNamesByUserId]
  );

  const roleColor = useCallback(
    (name: string) => {
      const index = roles.findIndex((role) => role.name === name);
      if (index < 0) return UNASSIGNED_ROLE_COLOR;
      return ROLE_RULER_COLORS[index % ROLE_RULER_COLORS.length];
    },
    [roles]
  );

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return users.filter((u) => {
      const names = roleNamesOf(u.id);
      if (selectedRole && !names.includes(selectedRole)) return false;
      if (!q) return true;
      const hay = [u.id, u.name, u.cli_abbr, u.email_addr, u.enabled, ...names]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, keyword, selectedRole, roleNamesOf]);

  const selectRoleFilter = (role: string) => {
    setPage(0);
    setSelectedRole((prev) => (prev === role ? '' : role));
  };

  const roleCount = (role: string) => users.filter((u) => roleNamesOf(u.id).includes(role)).length;

  const openAssign = (user: EdDSAUser) => {
    const current = roles.find((role) => role.referenceId && user.roleIds.includes(role.referenceId));
    setAssignUser(user);
    setPickedRoleId(current?.referenceId || '');
    setAssignError(null);
    setAssignSaving(false);
  };

  const closeAssign = () => {
    if (assignSaving) return;
    setAssignUser(null);
    setPickedRoleId('');
    setAssignError(null);
  };

  const saveAssign = async () => {
    if (!assignUser) return;
    const role = roles.find((item) => item.referenceId === pickedRoleId);
    if (!role) {
      setAssignError('请选择角色');
      return;
    }
    setAssignSaving(true);
    setAssignError(null);
    try {
      await assignEdDSAUserRole({
        roleReferenceId: role.referenceId,
        userReferenceId: assignUser.reference_id || '',
      });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === assignUser.id ? { ...user, roleIds: [role.referenceId] } : user
        )
      );
      setAssignMessage(`已为「${assignUser.name || assignUser.id}」指定角色「${role.name}」`);
      setAssignUser(null);
      setPickedRoleId('');
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : '指定角色失败');
    } finally {
      setAssignSaving(false);
    }
  };

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

      {assignMessage && (
        <Alert severity="success" sx={{ mx: 2, mb: 2 }} onClose={() => setAssignMessage(null)}>
          {assignMessage}
        </Alert>
      )}

      {rolesError && (
        <Alert severity="warning" sx={{ mx: 2, mb: 2 }} onClose={() => setRolesError(null)}>
          {rolesError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          maxWidth: 'calc(100% - 32px)',
          mx: 2,
          mb: 2,
          borderRadius: 1.5,
          overflowX: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          alignSelf: 'flex-start',
        }}
      >
        <Box
          onClick={() => selectRoleFilter('')}
          title={`全部（${users.length}）`}
          sx={{
            flex: '0 0 auto',
            px: 1.5,
            py: 1,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: '#455a64',
            color: '#fff',
            fontSize: 13,
            fontWeight: selectedRole === '' ? 700 : 500,
            filter: selectedRole === '' ? 'none' : 'saturate(0.75) brightness(0.92)',
            boxShadow: selectedRole === ''
              ? 'inset 0 0 0 2px rgba(255,255,255,0.95)'
              : 'inset 0 -2px 0 rgba(0,0,0,0.12)',
            borderRight: '1px solid rgba(255,255,255,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          全部（{users.length}）
        </Box>
        {roles.map((role, index) => {
          const selected = selectedRole === role.name;
          const color = ROLE_RULER_COLORS[index % ROLE_RULER_COLORS.length];
          const count = roleCount(role.name);
          return (
            <Box
              key={role.referenceId || role.name}
              onClick={() => selectRoleFilter(role.name)}
              title={`${role.name}（${count}）`}
              sx={{
                flex: '0 0 auto',
                px: 1.5,
                py: 1,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: color,
                color: '#fff',
                fontSize: 13,
                fontWeight: selected ? 700 : 500,
                filter: selected ? 'none' : 'saturate(0.75) brightness(0.92)',
                boxShadow: selected
                  ? 'inset 0 0 0 2px rgba(255,255,255,0.95)'
                  : 'inset 0 -2px 0 rgba(0,0,0,0.12)',
                borderRight: '1px solid rgba(255,255,255,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              {role.name}（{count}）
            </Box>
          );
        })}
        <Box
          onClick={() => navigate('/business/employees/roles')}
          title="角色管理"
          sx={{
            flex: '0 0 auto',
            px: 1.5,
            py: 1,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          角色管理
        </Box>
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
                <TableCell sx={{ fontWeight: 600 }}>角色</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && pageUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {selectedRole ? `暂无角色为「${selectedRole}」的员工` : '暂无用户数据'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageUsers.map((user) => (
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            minWidth: 0,
                          }}
                        >
                          {roleNamesOf(user.id).length === 0 ? (
                            <Chip
                              label="未分配"
                              size="small"
                              variant="outlined"
                              sx={roleChipSx(UNASSIGNED_ROLE_COLOR)}
                            />
                          ) : (
                            roleNamesOf(user.id).map((name) => (
                              <Chip
                                key={name}
                                label={name}
                                size="small"
                                variant="outlined"
                                title={name}
                                sx={roleChipSx(roleColor(name))}
                              />
                            ))
                          )}
                          <IconButton
                            size="small"
                            aria-label={`编辑 ${user.name || user.id} 的角色`}
                            onClick={() => openAssign(user)}
                            sx={{ flex: '0 0 auto', color: 'text.secondary' }}
                          >
                            <Edit fontSize="small" />
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
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to} 条，共 ${count} 条`}
        />
      </Paper>

      <Dialog open={Boolean(assignUser)} onClose={closeAssign} maxWidth="sm" fullWidth>
        <DialogTitle>选择角色</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {assignUser?.name || assignUser?.id || '员工'}
          </Typography>
          {assignError && (
            <Alert
              severity="error"
              onClose={() => setAssignError(null)}
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {assignError}
            </Alert>
          )}
          {roles.length === 0 ? (
            <Typography color="text.secondary">暂无可选角色</Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                maxWidth: '100%',
                borderRadius: 1.5,
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {roles.map((role, index) => {
                const selected = pickedRoleId === role.referenceId && role.referenceId !== '';
                const color = ROLE_RULER_COLORS[index % ROLE_RULER_COLORS.length];
                return (
                  <Box
                    key={role.referenceId || role.name}
                    role="button"
                    tabIndex={assignSaving || !role.referenceId ? -1 : 0}
                    aria-pressed={selected}
                    aria-label={role.name}
                    onClick={() => {
                      if (!assignSaving && role.referenceId) setPickedRoleId(role.referenceId);
                    }}
                    onKeyDown={(event) => {
                      if (assignSaving || !role.referenceId) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setPickedRoleId(role.referenceId);
                      }
                    }}
                    sx={{
                      flex: '0 0 auto',
                      px: 1.5,
                      py: 1,
                      minHeight: 40,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: assignSaving || !role.referenceId ? 'default' : 'pointer',
                      bgcolor: color,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: selected ? 700 : 500,
                      filter: selected ? 'none' : 'saturate(0.75) brightness(0.92)',
                      boxShadow: selected
                        ? 'inset 0 0 0 2px rgba(255,255,255,0.95)'
                        : 'inset 0 -2px 0 rgba(0,0,0,0.12)',
                      borderRight: '1px solid rgba(255,255,255,0.35)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {role.name}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAssign} disabled={assignSaving}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveAssign()}
            disabled={assignSaving || !pickedRoleId}
            startIcon={assignSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {assignSaving ? '保存中' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeListPage;
