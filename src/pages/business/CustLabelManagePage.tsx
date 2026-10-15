import React, { useCallback, useEffect, useState } from 'react';
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
  Typography,
} from '@mui/material';
import { ArrowBack, Delete, LocalOffer, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSessionCliAbbr } from '../../auth/session';
import {
  checkOperations,
  CustLabelStat,
  DEFAULT_LABEL_COLOR,
  deleteCustLabel,
  fetchCustLabelStats,
  OP_CUST_LABEL_MANAGE,
} from '../../data/customerApi';

const CustLabelManagePage: React.FC = () => {
  const navigate = useNavigate();
  const cliAbbr = getSessionCliAbbr();
  const [items, setItems] = useState<CustLabelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
  const [confirmLabel, setConfirmLabel] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadLabels = useCallback(async () => {
    if (!cliAbbr) {
      setItems([]);
      setError('登录会话缺少 cli_abbr，请重新登录');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCustLabelStats(cliAbbr);
      setItems(result.items);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : '加载标签列表失败');
    } finally {
      setLoading(false);
    }
  }, [cliAbbr]);

  useEffect(() => {
    let cancelled = false;
    void checkOperations([OP_CUST_LABEL_MANAGE])
      .then((auth) => {
        if (cancelled) return;
        const ok = Boolean(auth[OP_CUST_LABEL_MANAGE]);
        setAuthorized(ok);
        if (!ok) {
          setLoading(false);
          setError('无权限访问标签管理');
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
      void loadLabels();
    }
  }, [authorized, loadLabels]);

  const handleConfirmDelete = async () => {
    if (!cliAbbr || !confirmLabel) return;
    const label = confirmLabel;
    setDeletingLabel(label);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await deleteCustLabel(cliAbbr, label);
      setConfirmLabel(null);
      setSuccessMsg(
        `已删除标签「${result.label}」，并从 ${result.removedFromCustomers} 个客户中移除`
      );
      await loadLabels();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除标签失败');
    } finally {
      setDeletingLabel(null);
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
          {error || '无权限访问标签管理'}
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
                标签管理
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
            onClick={() => void loadLabels()}
            disabled={loading || !cliAbbr || !authorized}
            sx={{ borderRadius: 2 }}
          >
            刷新
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          删除标签会先从所有客户中移除该标签，再删除标签本身
        </Typography>
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
              <Button color="inherit" size="small" onClick={() => void loadLabels()}>
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
                <TableCell sx={{ fontWeight: 600 }}>标签</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>颜色</TableCell>
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
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无标签</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const color = item.color || DEFAULT_LABEL_COLOR;
                  return (
                    <TableRow key={item.label} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ bgcolor: color, width: 28, height: 28 }}>
                            <LocalOffer sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Chip
                            label={item.label}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: color,
                              color,
                              bgcolor: `${color}14`,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {color}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`删除标签 ${item.label}`}
                          disabled={Boolean(deletingLabel)}
                          onClick={() => setConfirmLabel(item.label)}
                        >
                          {deletingLabel === item.label ? (
                            <CircularProgress size={18} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(confirmLabel)} onClose={() => !deletingLabel && setConfirmLabel(null)}>
        <DialogTitle>确认删除标签</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除标签「{confirmLabel}」？将从所有客户中移除该标签，并删除标签目录记录。此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLabel(null)} disabled={Boolean(deletingLabel)}>
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmDelete()}
            disabled={Boolean(deletingLabel)}
          >
            {deletingLabel ? '删除中…' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustLabelManagePage;
