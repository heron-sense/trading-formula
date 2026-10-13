import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
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
  ArrowBack,
  CloudUpload,
  DeleteOutline,
  NavigateBefore,
  NavigateNext,
  Send,
} from '@mui/icons-material';
import type { Customer, CustomerStatus } from '../../models';
import { parseCustomerCsv } from '../../data/parseCustomerCsv';
import { batchCreateCustomers } from '../../data/customerApi';

const STEPS = ['上传 CSV', '核对编辑', '提交入库'];
const STATUS_OPTIONS: CustomerStatus[] = ['active', 'pending', 'inactive'];

const CustomerImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Customer[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const pagedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  const handleFile = async (file: File) => {
    setParseError(null);
    setSubmitResult(null);
    setSubmitError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('请上传 .csv 文件');
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseCustomerCsv(text);
      setFileName(file.name);
      setRows(parsed);
      setPage(0);
      setActiveStep(1);
    } catch (err) {
      setRows([]);
      setFileName('');
      setParseError(err instanceof Error ? err.message : '解析 CSV 失败');
    }
  };

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleFile(file);
    event.target.value = '';
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const updateRow = (absoluteIndex: number, field: keyof Customer, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      const row: Customer = { ...next[absoluteIndex] };
      switch (field) {
        case 'id':
          row.id = value;
          break;
        case 'name':
          row.name = value;
          break;
        case 'email':
          row.email = value;
          break;
        case 'phone':
          row.phone = value;
          break;
        case 'company':
          row.company = value;
          break;
        case 'status':
          row.status = value as CustomerStatus;
          break;
        case 'location':
          row.location = value;
          break;
        case 'registrationDate':
          row.registrationDate = value;
          break;
        case 'lastContact':
          row.lastContact = value;
          break;
        case 'avatar':
          row.avatar = value || undefined;
          break;
        default:
          break;
      }
      next[absoluteIndex] = row;
      return next;
    });
  };

  const removeRow = (absoluteIndex: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== absoluteIndex));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitResult(null);
    try {
      const result = await batchCreateCustomers(rows);
      setSubmitResult(
        `提交完成：共 ${result.total} 条，新增 ${result.inserted}，更新 ${result.updated}，失败 ${result.failed}`
      );
      if (result.errorSamples?.length) {
        setSubmitError(result.errorSamples.join('\n'));
      } else if (!result.success && result.message) {
        setSubmitError(result.message);
      }
      setActiveStep(2);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '提交失败');
      setActiveStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 3, mx: 2, mt: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/business/customers')}>
            返回列表
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
            新增客户（CSV 导入）
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          支持上传 `potential_cust` 格式 CSV（如 scripts/data/potential_cust_2000.csv）：解析后可二次编辑，再批量提交。
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={2} sx={{ mx: 2, mb: 2, p: 3, borderRadius: 2, flexGrow: 1 }}>
        {activeStep === 0 && (
          <Box>
            {parseError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {parseError}
              </Alert>
            )}
            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: 'primary.light',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'rgba(25, 118, 210, 0.04)',
                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
              }}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                点击或拖拽上传 CSV
              </Typography>
              <Typography variant="body2" color="text.secondary">
                表头需包含：id,name,email,phone,company,status,location,registration_date,last_contact,avatar
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={onInputChange}
              />
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={fileName || '未命名文件'} color="primary" variant="outlined" />
              <Chip label={`${rows.length} 行`} />
              <Box sx={{ flex: 1 }} />
              <Button
                startIcon={<NavigateBefore />}
                onClick={() => {
                  setActiveStep(0);
                  setRows([]);
                  setFileName('');
                }}
              >
                重新上传
              </Button>
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                disabled={rows.length === 0}
                onClick={() => setActiveStep(2)}
              >
                下一步：确认提交
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: '55vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>邮箱</TableCell>
                    <TableCell>电话</TableCell>
                    <TableCell>公司</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>城市</TableCell>
                    <TableCell>注册日期</TableCell>
                    <TableCell>最后联系</TableCell>
                    <TableCell width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.map((row, localIdx) => {
                    const absoluteIndex = page * rowsPerPage + localIdx;
                    return (
                      <TableRow key={`${row.id}-${absoluteIndex}`}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.id}
                            onChange={(e) => updateRow(absoluteIndex, 'id', e.target.value)}
                            sx={{ minWidth: 70 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.name}
                            onChange={(e) => updateRow(absoluteIndex, 'name', e.target.value)}
                            sx={{ minWidth: 90 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.email}
                            onChange={(e) => updateRow(absoluteIndex, 'email', e.target.value)}
                            sx={{ minWidth: 160 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.phone}
                            onChange={(e) => updateRow(absoluteIndex, 'phone', e.target.value)}
                            sx={{ minWidth: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.company}
                            onChange={(e) => updateRow(absoluteIndex, 'company', e.target.value)}
                            sx={{ minWidth: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={row.status}
                            onChange={(e) => updateRow(absoluteIndex, 'status', e.target.value)}
                            sx={{ minWidth: 110 }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.location}
                            onChange={(e) => updateRow(absoluteIndex, 'location', e.target.value)}
                            sx={{ minWidth: 90 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.registrationDate}
                            onChange={(e) =>
                              updateRow(absoluteIndex, 'registrationDate', e.target.value)
                            }
                            sx={{ minWidth: 110 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.lastContact}
                            onChange={(e) =>
                              updateRow(absoluteIndex, 'lastContact', e.target.value)
                            }
                            sx={{ minWidth: 110 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeRow(absoluteIndex)}
                            startIcon={<DeleteOutline />}
                          >
                            删
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={(_e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 100]}
              labelRowsPerPage="每页"
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              确认提交
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              即将把 <strong>{rows.length}</strong> 条客户写入表 `potential_cust`（已存在的 id 会更新）。
            </Typography>

            {submitResult && (
              <Alert severity="success" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {submitResult}
              </Alert>
            )}
            {submitError && (
              <Alert severity="warning" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {submitError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                startIcon={<NavigateBefore />}
                disabled={submitting}
                onClick={() => {
                  setActiveStep(1);
                  setSubmitError(null);
                  setSubmitResult(null);
                }}
              >
                返回编辑
              </Button>
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
                disabled={submitting || rows.length === 0 || Boolean(submitResult)}
                onClick={handleSubmit}
              >
                {submitting ? '提交中...' : '确认提交'}
              </Button>
              {submitResult && (
                <Button variant="outlined" onClick={() => navigate('/business/customers')}>
                  查看客户列表
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerImportPage;
