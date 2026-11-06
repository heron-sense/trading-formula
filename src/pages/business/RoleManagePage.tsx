import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSessionCliAbbr } from '../../auth/session';
import {
  EdDSARole,
  EdDSARoleOperation,
  fetchEdDSARoleDetail,
  fetchEdDSARoles,
  saveEdDSARole,
} from '../../data/employeeApi';

const MAX_ROLE_LEN = 64;

const RoleManagePage: React.FC = () => {
  const navigate = useNavigate();
  const cliAbbr = getSessionCliAbbr();
  const [items, setItems] = useState<EdDSARole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [detailRoleId, setDetailRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [operations, setOperations] = useState<EdDSARoleOperation[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [operationsError, setOperationsError] = useState<string | null>(null);
  const [selectedOperationCodes, setSelectedOperationCodes] = useState<string[]>([]);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchEdDSARoles());
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : '加载角色列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const loadOperations = useCallback(async (roleReferenceId: string) => {
    setOperationsLoading(true);
    setOperationsError(null);
    try {
      const list = await fetchEdDSARoleDetail(roleReferenceId);
      setOperations(list);
      setSelectedOperationCodes(list.filter((item) => item.authorized).map((item) => item.operationCode));
    } catch (err) {
      setOperations([]);
      setSelectedOperationCodes([]);
      setOperationsError(err instanceof Error ? err.message : '获取权限列表失败');
    } finally {
      setOperationsLoading(false);
    }
  }, []);

  const openCreate = () => {
    setEditingRole(false);
    setDetailRoleId('');
    setRoleName('');
    setOperations([]);
    setSelectedOperationCodes([]);
    setOperationsError(null);
    setDialogError(null);
    setCreateOpen(true);
    void loadOperations('');
  };

  const openEdit = (role: EdDSARole) => {
    setEditingRole(true);
    setDetailRoleId(role.referenceId);
    setRoleName(role.name);
    setOperations([]);
    setSelectedOperationCodes([]);
    setOperationsError(null);
    setDialogError(null);
    setCreateOpen(true);
    if (!role.referenceId) {
      setOperations([]);
      setSelectedOperationCodes([]);
      setOperationsError('该角色缺少 reference_id，无法读取已授权状态');
      return;
    }
    void loadOperations(role.referenceId);
  };

  const closeCreate = () => {
    if (saving) return;
    setCreateOpen(false);
  };

  const choicesLocked = saving || operationsLoading;

  const toggleOperation = (operationCode: string) => {
    setSelectedOperationCodes((prev) =>
      prev.includes(operationCode) ? prev.filter((code) => code !== operationCode) : [...prev, operationCode]
    );
  };

  const operationStatusLabel = (operation: EdDSARoleOperation) => {
    if (operation.authorized) return '已授权';
    if (selectedOperationCodes.includes(operation.operationCode)) return '已选择';
    return '未授权';
  };

  const handleSave = async () => {
    if (!cliAbbr) {
      setDialogError('登录会话缺少 cli_abbr，请重新登录');
      return;
    }
    const name = roleName.trim();
    if (!name) {
      setDialogError('请填写角色名称');
      return;
    }
    setSaving(true);
    setDialogError(null);
    setSuccessMsg(null);
    try {
      await saveEdDSARole({
        cliAbbr,
        name: name.slice(0, MAX_ROLE_LEN),
        referenceIds: selectedOperationCodes,
      });
      setCreateOpen(false);
      setRoleName('');
      setSelectedOperationCodes([]);
      setSuccessMsg(`已保存角色「${name}」`);
      await loadRoles();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : '保存角色失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, mx: 2, mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <IconButton aria-label="返回员工列表" onClick={() => navigate('/business/employees')} size="small">
              <ArrowBack />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                角色管理
              </Typography>
              {cliAbbr && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  客户简称：{cliAbbr}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void loadRoles()}
            disabled={loading || !cliAbbr}
            sx={{ borderRadius: 2, flexShrink: 0 }}
          >
            刷新
          </Button>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          disabled={!cliAbbr}
          onClick={openCreate}
          sx={{
            borderRadius: 2,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: 40,
            minHeight: 40,
            px: 2,
            mt: 1.5,
          }}
        >
          新增角色
        </Button>
      </Paper>

      <Paper
        elevation={2}
        sx={{ borderRadius: 2, mx: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        {successMsg && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            action={
              <Button color="inherit" size="small" onClick={() => void loadRoles()}>
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
                <TableCell sx={{ fontWeight: 600 }}>角色</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  权限数
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无角色</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.name} hover>
                    <TableCell sx={{ maxWidth: 360, wordBreak: 'break-word' }}>{item.name}</TableCell>
                    <TableCell align="right">{item.permissionCount}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openEdit(item)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={createOpen} onClose={closeCreate} maxWidth="lg" fullWidth>
        <DialogTitle>{editingRole ? '编辑角色' : '新增角色'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          {dialogError && (
            <Alert
              severity="error"
              onClose={() => setDialogError(null)}
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            required
            label="角色名称"
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value.slice(0, MAX_ROLE_LEN));
              setDialogError(null);
            }}
            disabled={saving}
            inputProps={{ maxLength: MAX_ROLE_LEN, 'aria-label': '角色名称' }}
            helperText="必填"
            sx={{ mt: 1, maxWidth: 420 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              角色权限
            </Typography>
            {operationsError && (
              <Alert
                severity="error"
                sx={{ mb: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                action={
                  <Button color="inherit" size="small" onClick={() => void loadOperations(detailRoleId)} disabled={operationsLoading}>
                    重试
                  </Button>
                }
              >
                {operationsError}
              </Alert>
            )}
            <TableContainer sx={{ maxHeight: 420, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Table stickyHeader size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: 120 }}>状态</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: 200 }}>权限名</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>功能描述</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : operations.length === 0 && !operationsError ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">暂无可选权限</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    operations.map((operation) => {
                      const statusLabel = operationStatusLabel(operation);
                      const selectable = !operation.authorized;
                      const permissionName = operation.name || '未命名权限';
                      return (
                        <TableRow key={operation.operationCode} hover selected={statusLabel !== '未授权'}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Button
                              size="small"
                              variant={statusLabel === '未授权' ? 'outlined' : 'contained'}
                              color={
                                statusLabel === '已授权' ? 'success' : statusLabel === '已选择' ? 'primary' : 'inherit'
                              }
                              disabled={choicesLocked || !selectable}
                              onClick={() => {
                                if (selectable) toggleOperation(operation.operationCode);
                              }}
                              aria-pressed={statusLabel === '已选择'}
                              aria-label={`${permissionName} ${statusLabel}`}
                              sx={{
                                whiteSpace: 'nowrap',
                                minWidth: 88,
                                ...(statusLabel === '已授权'
                                  ? {
                                      '&.Mui-disabled': {
                                        bgcolor: 'success.main',
                                        color: 'success.contrastText',
                                        opacity: 1,
                                      },
                                    }
                                  : {}),
                              }}
                            >
                              {statusLabel}
                            </Button>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {operation.name || '—'}
                          </TableCell>
                          <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            {operation.description || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCreate} disabled={saving}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={saving || operationsLoading || Boolean(operationsError) || !roleName.trim()}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? '保存中' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default RoleManagePage;
