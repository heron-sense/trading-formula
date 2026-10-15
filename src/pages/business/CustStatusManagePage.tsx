import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { Add, ArrowBack, Delete, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSessionCliAbbr } from '../../auth/session';
import {
  addCustStatusDef,
  checkOperations,
  CustStatusStat,
  deleteCustStatusDef,
  fetchCustStatusStats,
  OP_CUST_STATUS_MANAGE,
} from '../../data/customerApi';

const MAX_STATUS_LEN = 32;

const CustStatusManagePage: React.FC = () => {
  const navigate = useNavigate();
  const cliAbbr = getSessionCliAbbr();
  const [items, setItems] = useState<CustStatusStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adding, setAdding] = useState(false);

  const loadStatuses = useCallback(async () => {
    if (!cliAbbr) {
      setItems([]);
      setError('登录会话缺少 cli_abbr，请重新登录');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchCustStatusStats(cliAbbr);
      setItems(stats);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : '加载状态列表失败');
    } finally {
      setLoading(false);
    }
  }, [cliAbbr]);

  useEffect(() => {
    let cancelled = false;
    void checkOperations([OP_CUST_STATUS_MANAGE])
      .then((auth) => {
        if (cancelled) return;
        const ok = Boolean(auth[OP_CUST_STATUS_MANAGE]);
        setAuthorized(ok);
        if (!ok) {
          setLoading(false);
          setError('无权限访问状态管理');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAuthorized(false);
        setLoading(false);
        setError('权限检查失败');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authorized) {
      void loadStatuses();
    }
  }, [authorized, loadStatuses]);

  const handleAdd = async () => {
    if (!cliAbbr) return;
    const trimmed = newStatus.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const saved = await addCustStatusDef(cliAbbr, trimmed.slice(0, MAX_STATUS_LEN));
      setNewStatus('');
      setSuccessMsg(`已新增状态「${saved}」`);
      await loadStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增状态失败');
    } finally {
      setAdding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cliAbbr || !confirmStatus) return;
    const status = confirmStatus;
    setDeletingStatus(status);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await deleteCustStatusDef(cliAbbr, status);
      setConfirmStatus(null);
      setSuccessMsg(
        `已删除状态「${result.status}」` +
          (result.reassignedFromCustomers > 0
            ? `，已将 ${result.reassignedFromCustomers} 个客户改至「${result.reassignedTo}」`
            : '')
      );
      await loadStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除状态失败');
    } finally {
      setDeletingStatus(null);
    }
  };

  if (authorized === false) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/business/customers')}>
              返回
            </Button>
          }
        >
          {error || '无权限访问状态管理'}
        </Alert>
      </Box>
    );
  }

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              aria-label="返回客户列表"
              onClick={() => navigate('/business/customers')}
              size="small"
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                状态管理
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
            onClick={() => void loadStatuses()}
            disabled={loading || !cliAbbr || !authorized}
            sx={{ borderRadius: 2 }}
          >
            刷新
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          删除状态时，使用该状态的客户会自动改到「待处理」（或其它剩余状态）
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleAdd();
          }}
          sx={{ display: 'flex', gap: 1, maxWidth: 480 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="新增状态名称"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value.slice(0, MAX_STATUS_LEN))}
            inputProps={{ maxLength: MAX_STATUS_LEN }}
            disabled={!cliAbbr || adding || !authorized}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<Add />}
            disabled={!cliAbbr || !newStatus.trim() || adding || !authorized}
            sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
          >
            {adding ? '添加中…' : '新增'}
          </Button>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{ borderRadius: 2, mx: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {successMsg && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => void loadStatuses()}>
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
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  客户数
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
                    <Typography color="text.secondary">暂无状态</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.status} hover>
                    <TableCell>
                      <Chip label={item.status} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`删除状态 ${item.status}`}
                        disabled={Boolean(deletingStatus) || items.length <= 1}
                        onClick={() => setConfirmStatus(item.status)}
                      >
                        {deletingStatus === item.status ? (
                          <CircularProgress size={18} />
                        ) : (
                          <Delete fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={Boolean(confirmStatus)}
        onClose={() => !deletingStatus && setConfirmStatus(null)}
      >
        <DialogTitle>确认删除状态</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除状态「{confirmStatus}」？使用该状态的客户将被改到其它可用状态，目录记录也会删除。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStatus(null)} disabled={Boolean(deletingStatus)}>
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmDelete()}
            disabled={Boolean(deletingStatus)}
          >
            {deletingStatus ? '删除中…' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustStatusManagePage;
