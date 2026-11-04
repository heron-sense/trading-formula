import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { getSessionCliAbbr } from '../../auth/session';
import { createCustomer, fetchCustLabels, fetchCustStatuses } from '../../data/customerApi';

const NAME_MAX = 64;
const PHONE_MAX = 32;
const EMAIL_MAX = 128;
const COMPANY_MAX = 128;
const LOCATION_MAX = 128;
const SUMMARY_MAX = 100;
const TAG_MAX = 64;
const TAG_COUNT_MAX = 20;

type FieldKey = 'name' | 'phone' | 'email' | 'company' | 'location' | 'summary' | 'tags';
type FieldErrors = Partial<Record<FieldKey, string>>;

function readableError(err: unknown, fallback: string): string {
  if (
    err instanceof Error &&
    err.message &&
    !/^Request failed with status code \d+$/.test(err.message)
  ) {
    return err.message;
  }
  return fallback;
}

function runeCount(value: string): number {
  return [...value].length;
}

function normalizeTags(values: string[]): string[] {
  const next: string[] = [];
  for (const raw of values) {
    const tag = raw.trim();
    if (!tag || next.includes(tag)) continue;
    next.push(tag);
  }
  return next;
}

const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [labelOptions, setLabelOptions] = useState<string[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusLoadError, setStatusLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setStatusLoading(false);
      setStatusLoadError('未登录企业，状态将保存为待处理');
      return;
    }
    let cancelled = false;
    setStatusLoading(true);
    void fetchCustStatuses(cliAbbr)
      .then((items) => {
        if (cancelled) return;
        setStatusOptions(items);
        setStatus((prev) => prev || items[0] || '');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatusLoadError(readableError(err, '获取状态列表失败'));
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    void fetchCustLabels(cliAbbr)
      .then((items) => {
        if (cancelled) return;
        setLabelOptions(items.map((item) => item.label).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setLabelOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusChoices = statusOptions.length > 0 ? statusOptions : ['待处理'];
  const statusValue = statusChoices.includes(status) ? status : statusChoices[0];

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const nameValue = name.trim();
    const phoneValue = phone.trim();
    const emailValue = email.trim();
    const companyValue = company.trim();
    const locationValue = location.trim();
    const summaryValue = summary.trim();

    if (!nameValue) errors.name = '请填写姓名';
    else if (runeCount(nameValue) > NAME_MAX) errors.name = `姓名不能超过 ${NAME_MAX} 个字`;
    if (runeCount(phoneValue) > PHONE_MAX) errors.phone = `电话不能超过 ${PHONE_MAX} 个字`;
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      errors.email = '邮箱格式不正确';
    } else if (runeCount(emailValue) > EMAIL_MAX) {
      errors.email = `邮箱不能超过 ${EMAIL_MAX} 个字`;
    }
    if (runeCount(companyValue) > COMPANY_MAX) errors.company = `公司不能超过 ${COMPANY_MAX} 个字`;
    if (runeCount(locationValue) > LOCATION_MAX) errors.location = `地区不能超过 ${LOCATION_MAX} 个字`;
    if (runeCount(summaryValue) > SUMMARY_MAX) errors.summary = `概要不能超过 ${SUMMARY_MAX} 个字`;
    if (tags.length > TAG_COUNT_MAX) errors.tags = `标签不能超过 ${TAG_COUNT_MAX} 个`;
    else if (tags.some((tag) => runeCount(tag) > TAG_MAX)) {
      errors.tags = `单个标签不能超过 ${TAG_MAX} 个字`;
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('请先修正表单中的错误');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const savedName = name.trim();
    try {
      await createCustomer({
        name: savedName,
        phone,
        email,
        company,
        location,
        status: statusValue,
        summary,
        tags,
      });
      navigate('/business/customers', { state: { createdName: savedName } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '保存客户失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', minWidth: 0 }}>
      <Paper elevation={3} sx={{ px: 3, py: 2, mx: 2, mt: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/business/customers')}
            sx={{ flexShrink: 0 }}
          >
            返回列表
          </Button>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            逐个新增客户
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          填写一位客户的资料并提交。登记日期按当天写入，保存成功后返回客户列表。
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ mx: 2, mb: 2, p: 3, borderRadius: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 880,
            width: '100%',
            minWidth: 0,
          }}
        >
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)} sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {submitError}
            </Alert>
          )}
          {statusLoadError && (
            <Alert severity="warning">{statusLoadError}，仍可提交，状态将使用「{statusValue}」。</Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
              gap: 2,
              minWidth: 0,
            }}
          >
            <TextField
              required
              label="姓名"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name || '必填'}
              disabled={submitting}
              inputProps={{ maxLength: NAME_MAX, 'aria-label': '姓名' }}
              sx={{ minWidth: 0 }}
            />
            <TextField
              label="电话"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone || '可选'}
              disabled={submitting}
              inputProps={{ maxLength: PHONE_MAX, 'aria-label': '电话' }}
              sx={{ minWidth: 0 }}
            />
            <TextField
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || '可选'}
              disabled={submitting}
              inputProps={{ maxLength: EMAIL_MAX, 'aria-label': '邮箱' }}
              sx={{ minWidth: 0 }}
            />
            <TextField
              label="公司"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setFieldErrors((prev) => ({ ...prev, company: undefined }));
              }}
              error={Boolean(fieldErrors.company)}
              helperText={fieldErrors.company || '可选'}
              disabled={submitting}
              inputProps={{ maxLength: COMPANY_MAX, 'aria-label': '公司' }}
              sx={{ minWidth: 0 }}
            />
            <TextField
              label="地区"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setFieldErrors((prev) => ({ ...prev, location: undefined }));
              }}
              error={Boolean(fieldErrors.location)}
              helperText={fieldErrors.location || '可选'}
              disabled={submitting}
              inputProps={{ maxLength: LOCATION_MAX, 'aria-label': '地区' }}
              sx={{ minWidth: 0 }}
            />
            <TextField
              select
              label="状态"
              value={statusLoading ? '' : statusValue}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting || statusLoading}
              helperText={statusLoading ? '正在加载状态' : '来自客户状态目录'}
              inputProps={{ 'aria-label': '状态' }}
              sx={{ minWidth: 0 }}
            >
              {statusLoading ? (
                <MenuItem value="">加载中</MenuItem>
              ) : (
                statusChoices.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              label="概要"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setFieldErrors((prev) => ({ ...prev, summary: undefined }));
              }}
              error={Boolean(fieldErrors.summary)}
              helperText={fieldErrors.summary || `${runeCount(summary.trim())}/${SUMMARY_MAX}`}
              disabled={submitting}
              multiline
              minRows={3}
              inputProps={{ maxLength: SUMMARY_MAX, 'aria-label': '概要' }}
              sx={{ gridColumn: { sm: '1 / -1' }, minWidth: 0 }}
            />
            <Autocomplete
              multiple
              freeSolo
              options={labelOptions}
              value={tags}
              disabled={submitting}
              onChange={(_event, value) => {
                setTags(normalizeTags(value.map((item) => String(item))));
                setFieldErrors((prev) => ({ ...prev, tags: undefined }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="标签"
                  placeholder={tags.length === 0 ? '选择已有标签，或输入后回车' : ''}
                  error={Boolean(fieldErrors.tags)}
                  helperText={fieldErrors.tags || '可选'}
                />
              )}
              sx={{ gridColumn: { sm: '1 / -1' }, minWidth: 0 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/business/customers')} disabled={submitting}>
              取消
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
            >
              {submitting ? '提交中' : '提交'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerCreatePage;
