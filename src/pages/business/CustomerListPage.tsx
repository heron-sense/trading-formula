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
  IconButton,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  CircularProgress,
  Alert,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Autocomplete,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  ListItemIcon,
  Radio,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  LocationOn,
  Refresh,
  PersonAdd,
  UploadFile,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Customer } from '../../models';
import { getAuthUser, getSessionCliAbbr } from '../../auth/session';
import {
  EdDSARole,
  fetchEdDSARoles,
  fetchEdDSAUserList,
  singleRoleId,
} from '../../data/employeeApi';
import {
  addCustFollowUp,
  addCustLabel,
  batchAssignCustomers,
  batchDeleteCustomers,
  checkOperations,
  CustLabelItem,
  CustLabelStat,
  DEFAULT_LABEL_COLOR,
  LABEL_COLOR_OPTIONS,
  CustStatusStat,
  ALL_ROLES_ASSIGNEE_SCOPE,
  fetchAssigneeStats,
  fetchCustLabelStats,
  fetchCustLabels,
  fetchCustStatuses,
  fetchCustStatusStats,
  fetchCustomers,
  OP_CUST_LABEL_MANAGE,
  OP_CUST_PROFILE_EDIT,
  OP_CUST_STATUS_MANAGE,
  updateCustProfile,
  updateCustStatus,
  updateCustSummary,
} from '../../data/customerApi';

const MAX_SUMMARY_LEN = 100;
const MAX_FOLLOW_UP_LEN = 500;
const MAX_CUST_NAME_LEN = 64;
const MAX_CUST_PHONE_LEN = 32;
const MAX_CUST_EMAIL_LEN = 128;

const labelChipSx = (color: string) => ({
  maxWidth: 88,
  borderColor: color,
  color,
  bgcolor: `${color}14`,
});

const FOLLOWER_COLORS = [
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#1976d2',
  '#7b1fa2',
  '#00838f',
  '#5d4037',
  '#455a64',
] as const;
const ALL_ROLES_COLOR = '#607d8b';

const followerChipSx = (color: string) => ({
  ...labelChipSx(color),
  maxWidth: 120,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const checkerboardImage = (bgcolor: string) =>
  `linear-gradient(45deg, ${bgcolor} 25%, transparent 25%), linear-gradient(-45deg, ${bgcolor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${bgcolor} 75%), linear-gradient(-45deg, transparent 75%, ${bgcolor} 75%)`;

const rulerCellFrame = (row: number, index: number, count: number) => {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return {
    gridColumn: index + 3,
    gridRow: row,
    justifySelf: 'stretch',
    borderStyle: 'solid',
    borderColor: 'divider',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: isFirst ? 1 : 0,
    borderRightWidth: 1,
    borderTopLeftRadius: isFirst ? 6 : 0,
    borderBottomLeftRadius: isFirst ? 6 : 0,
    borderTopRightRadius: isLast ? 6 : 0,
    borderBottomRightRadius: isLast ? 6 : 0,
  };
};

const quickFilterButtonSx = (bgcolor: string, selected: boolean) => ({
  flex: '0 0 auto',
  px: 1.5,
  py: 1,
  textAlign: 'center' as const,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: 'nowrap' as const,
  ...(selected
    ? {
        bgcolor,
        color: '#fff',
        backgroundImage: 'none',
      }
    : {
        color: '#212121',
        backgroundColor: '#fff',
        backgroundImage: checkerboardImage(bgcolor),
        backgroundSize: '2px 2px',
        backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0',
      }),
});

const quickFilterLabelSx = {
  flex: '0 0 6em',
  width: '6em',
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: 'nowrap' as const,
  textAlign: 'left' as const,
  color: 'text.primary',
};

interface CustomerSearchFilters {
  name: string;
  tags: string[];
  registrationDateFrom: string;
  registrationDateTo: string;
  lastContactFrom: string;
  lastContactTo: string;
}

const emptyFilters: CustomerSearchFilters = {
  name: '',
  tags: [],
  registrationDateFrom: '',
  registrationDateTo: '',
  lastContactFrom: '',
  lastContactTo: '',
};

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createdName =
    (location.state as { createdName?: string } | null)?.createdName?.trim() || '';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [draftFilters, setDraftFilters] = useState<CustomerSearchFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<CustomerSearchFilters>(emptyFilters);
  const [filterLabelOptions, setFilterLabelOptions] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [visibilityTotal, setVisibilityTotal] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [assigneeCounts, setAssigneeCounts] = useState<Record<string, number>>({});
  const [statusStats, setStatusStats] = useState<CustStatusStat[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [labelStats, setLabelStats] = useState<CustLabelStat[]>([]);
  const [totalCust, setTotalCust] = useState(0);
  const [untaggedCust, setUntaggedCust] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [labelAnchorEl, setLabelAnchorEl] = useState<HTMLElement | null>(null);
  const [availableLabels, setAvailableLabels] = useState<CustLabelItem[]>([]);
  const [labelColorMap, setLabelColorMap] = useState<Record<string, string>>({});
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [addingLabel, setAddingLabel] = useState<string | null>(null);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<string>(DEFAULT_LABEL_COLOR);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [summarySaving, setSummarySaving] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [canManageLabels, setCanManageLabels] = useState(false);
  const [canManageStatuses, setCanManageStatuses] = useState(false);
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', phone: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDeleteOpen, setDetailDeleteOpen] = useState(false);
  const [detailDeleting, setDetailDeleting] = useState(false);
  const [detailDeleteError, setDetailDeleteError] = useState<string | null>(null);
  const [roleCatalog, setRoleCatalog] = useState<EdDSARole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState('');
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(
    createdName ? `已新增客户「${createdName}」` : null
  );
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const nowFollowUpDateTime = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  };

  const ensureFollowUpDateTimeDefaults = () => {
    const now = nowFollowUpDateTime();
    setFollowUpDate((prev) => prev || now.date);
    setFollowUpTime((prev) => prev || now.time);
  };

  const mergeLabelColors = useCallback((items: { label: string; color?: string }[]) => {
    setLabelColorMap((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (!item.label) continue;
        next[item.label] = item.color?.trim() || next[item.label] || DEFAULT_LABEL_COLOR;
      }
      return next;
    });
  }, []);

  const colorForLabel = (label: string) => labelColorMap[label] || DEFAULT_LABEL_COLOR;

  const loadLabelStats = useCallback(async () => {
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setLabelStats([]);
      setUntaggedCust(0);
      return;
    }
    setStatsLoading(true);
    try {
      const result = await fetchCustLabelStats(cliAbbr);
      setLabelStats(result.items);
      mergeLabelColors(result.items);
      setTotalCust(result.totalCust);
      setUntaggedCust(result.untaggedCust);
    } catch (err) {
      // Keep totalCust from customer list fallback; only clear per-label cards.
      setLabelStats([]);
      setUntaggedCust(0);
      console.error('加载标签统计失败', err);
    } finally {
      setStatsLoading(false);
    }
  }, [mergeLabelColors]);

  const loadStatusStats = useCallback(async () => {
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setStatusStats([]);
      return;
    }
    try {
      const stats = await fetchCustStatusStats(cliAbbr);
      setStatusStats(stats);
      setStatusOptions(stats.map((s) => s.status));
    } catch {
      setStatusStats([]);
    }
  }, []);

  const roleNameOf = (roleId?: string) => {
    const id = roleId?.trim() || '';
    if (!id) return '';
    return roleCatalog.find((role) => role.referenceId === id)?.name || id;
  };

  const followerLabel = (assignee?: string) => {
    const id = assignee?.trim() || '';
    if (!id) return '所有角色';
    return roleNameOf(id);
  };

  const followerColor = (assignee?: string) => {
    const id = assignee?.trim() || '';
    if (!id) return ALL_ROLES_COLOR;
    const index = roleCatalog.findIndex((role) => role.referenceId === id);
    if (index < 0) return FOLLOWER_COLORS[0];
    return FOLLOWER_COLORS[index % FOLLOWER_COLORS.length];
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let roleId = '';
      const abbr = getSessionCliAbbr();
      if (abbr) {
        const listed = await fetchEdDSAUserList(abbr);
        setRoleCatalog(listed.roles);
        const me = getAuthUser();
        const mine = listed.users.find((user) => user.id === me?.id);
        roleId = singleRoleId(mine?.roleIds ?? [], listed.roles);
      }
      const result = await fetchCustomers({
        page: page + 1,
        pageSize: rowsPerPage,
        name: appliedFilters.name || undefined,
        tag: selectedTag || undefined,
        tags:
          !selectedTag && appliedFilters.tags.length > 0
            ? appliedFilters.tags
            : undefined,
        status: selectedStatus || undefined,
        registrationDateFrom: appliedFilters.registrationDateFrom || undefined,
        registrationDateTo: appliedFilters.registrationDateTo || undefined,
        lastContactFrom: appliedFilters.lastContactFrom || undefined,
        lastContactTo: appliedFilters.lastContactTo || undefined,
        roleId: roleId || undefined,
        assigneeScope: selectedVisibility || undefined,
      });
      try {
        const stats = await fetchAssigneeStats(roleId || undefined);
        setVisibilityTotal(stats.total);
        setUnassignedCount(stats.unassigned);
        setAssigneeCounts(stats.counts);
      } catch (statsErr) {
        console.error('加载可见范围统计失败', statsErr);
      }
      setCustomers(result.items);
      setTotal(result.total);
      // 「全部客户」以列表未筛选总数为准，避免统计接口失败时一直显示 0
      const noFilters =
        !selectedTag &&
        !selectedVisibility &&
        !selectedStatus &&
        !appliedFilters.name &&
        appliedFilters.tags.length === 0 &&
        !appliedFilters.registrationDateFrom &&
        !appliedFilters.registrationDateTo &&
        !appliedFilters.lastContactFrom &&
        !appliedFilters.lastContactTo;
      if (noFilters) {
        setTotalCust(result.total);
      }
    } catch (err) {
      setCustomers([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : '加载客户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, appliedFilters, selectedTag, selectedStatus, selectedVisibility]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    clearSelection();
    resetBatchAction();
  }, [page, rowsPerPage, appliedFilters, selectedTag, selectedStatus, selectedVisibility]);

  useEffect(() => {
    void loadLabelStats();
  }, [loadLabelStats]);

  useEffect(() => {
    void loadStatusStats();
  }, [loadStatusStats]);

  useEffect(() => {
    let cancelled = false;
    void checkOperations([OP_CUST_LABEL_MANAGE, OP_CUST_STATUS_MANAGE, OP_CUST_PROFILE_EDIT])
      .then((auth) => {
        if (cancelled) return;
        setCanManageLabels(Boolean(auth[OP_CUST_LABEL_MANAGE]));
        setCanManageStatuses(Boolean(auth[OP_CUST_STATUS_MANAGE]));
        setCanEditProfile(Boolean(auth[OP_CUST_PROFILE_EDIT]));
      })
      .catch(() => {
        if (cancelled) return;
        setCanManageLabels(false);
        setCanManageStatuses(false);
        setCanEditProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) return;
    void fetchCustLabels(cliAbbr)
      .then((items) => {
        setFilterLabelOptions(items.map((i) => i.label).sort());
        mergeLabelColors(items);
      })
      .catch(() => setFilterLabelOptions([]));
  }, [mergeLabelColors]);

  useEffect(() => {
    if (labelStats.length > 0) {
      setFilterLabelOptions((prev) => {
        const merged = new Set([...prev, ...labelStats.map((s) => s.label)]);
        return Array.from(merged).sort();
      });
      mergeLabelColors(labelStats);
    }
  }, [labelStats, mergeLabelColors]);

  const selectTagFilter = (tag: string) => {
    setPage(0);
    setSelectedTag(tag);
  };

  const selectVisibilityFilter = (scope: string) => {
    setPage(0);
    setSelectedVisibility(scope);
  };

  const visibilityRoles = roleCatalog.filter(
    (role, index, list) =>
      Boolean(role.referenceId) &&
      list.findIndex((item) => item.referenceId === role.referenceId) === index
  );

  const selectStatusFilter = (status: string) => {
    setPage(0);
    setSelectedStatus((prev) => (prev === status ? '' : status));
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    setSelectedTag('');
    setSelectedStatus('');
    setAppliedFilters({
      ...draftFilters,
      name: draftFilters.name.trim(),
    });
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const syncCustomerFields = (custId: string, patch: Partial<Customer>) => {
    setSelectedCustomer((prev) => (prev && prev.id === custId ? { ...prev, ...patch } : prev));
    setCustomers((prev) =>
      prev.map((c) => (c.id === custId ? { ...c, ...patch } : c))
    );
  };

  const pageIds = customers.map((c) => c.id);
  const selectedOnPageCount = pageIds.filter((id) => selectedIds.includes(id)).length;
  const allPageSelected = pageIds.length > 0 && selectedOnPageCount === pageIds.length;
  const somePageSelected = selectedOnPageCount > 0 && !allPageSelected;

  const clearSelection = () => setSelectedIds([]);

  const selectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  const toggleSelectAllOnPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    selectAllOnPage();
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetBatchAction = () => setBatchAction('');

  const loadRolesForAssign = useCallback(async () => {
    setRolesLoading(true);
    setBatchError(null);
    try {
      const list = await fetchEdDSARoles();
      setRoleCatalog(list);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : '加载角色列表失败');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const handleBatchActionChange = (action: string) => {
    setBatchAction(action);
    setBatchError(null);
    setBatchMessage(null);
    if (!action) return;
    if (selectedIds.length === 0) {
      setBatchError('请先选择客户');
      resetBatchAction();
      return;
    }
    if (action === 'assign') {
      setAssignRoleId('');
      setAssignDialogOpen(true);
      void loadRolesForAssign();
      return;
    }
    if (action === 'delete') {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignRoleId || selectedIds.length === 0) return;
    const role = roleCatalog.find((item) => item.referenceId === assignRoleId);
    if (!role?.referenceId) {
      setBatchError('请选择角色');
      return;
    }
    setBatchBusy(true);
    setBatchError(null);
    try {
      const result = await batchAssignCustomers(selectedIds, role.referenceId);
      selectedIds.forEach((id) => {
        syncCustomerFields(id, { assignee: result.assignee });
      });
      setBatchMessage(`已将 ${result.updated} 个客户指派给角色「${role.name}」`);
      setAssignDialogOpen(false);
      clearSelection();
      resetBatchAction();
      await loadCustomers();
      void loadLabelStats();
      void loadStatusStats();
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : '指派失败');
    } finally {
      setBatchBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return;
    setBatchBusy(true);
    setBatchError(null);
    try {
      const deleted = await batchDeleteCustomers(selectedIds);
      setBatchMessage(`已删除 ${deleted} 个客户`);
      setDeleteDialogOpen(false);
      clearSelection();
      resetBatchAction();
      await loadCustomers();
      void loadLabelStats();
      void loadStatusStats();
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : '批量删除失败');
    } finally {
      setBatchBusy(false);
    }
  };

  const closeAssignDialog = () => {
    if (batchBusy) return;
    setAssignDialogOpen(false);
    resetBatchAction();
  };

  const closeDeleteDialog = () => {
    if (batchBusy) return;
    setDeleteDialogOpen(false);
    resetBatchAction();
  };

  const handleDeleteDetailCustomer = async () => {
    if (!selectedCustomer || detailDeleting) return;
    const name = selectedCustomer.name || selectedCustomer.id;
    setDetailDeleting(true);
    setDetailDeleteError(null);
    try {
      await batchDeleteCustomers([selectedCustomer.id]);
      setDetailDeleteOpen(false);
      setDetailDialogOpen(false);
      setSelectedCustomer(null);
      setBatchMessage(`已删除客户「${name}」`);
      await loadCustomers();
      void loadLabelStats();
      void loadStatusStats();
    } catch (err) {
      setDetailDeleteError(err instanceof Error ? err.message : '删除客户失败');
    } finally {
      setDetailDeleting(false);
    }
  };

  const loadStatusOptions = useCallback(async () => {
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setStatusOptions([]);
      return;
    }
    try {
      const statuses = await fetchCustStatuses(cliAbbr);
      setStatusOptions(statuses);
    } catch {
      setStatusOptions([]);
    }
  }, []);

  useEffect(() => {
    void loadStatusOptions();
  }, [loadStatusOptions]);

  const handleViewCustomer = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setSummaryDraft(customer.summary || '');
    setSummaryError(null);
    setFollowUpDraft('');
    const now = nowFollowUpDateTime();
    setFollowUpDate(now.date);
    setFollowUpTime(now.time);
    setFollowUpError(null);
    setStatusError(null);
    setProfileEditing(false);
    setProfileDraft({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
    });
    setProfileError(null);
    setDetailDialogOpen(true);
    setLabelError(null);
    setLabelAnchorEl(null);
    setNewLabelInput('');
    void loadStatusOptions();
  };

  const startProfileEdit = () => {
    if (!selectedCustomer) return;
    if (!canEditProfile) {
      setProfileError('无权限编辑客户信息（需要权限 PUT/api/business/cust-profile）');
      return;
    }
    setProfileDraft({
      name: selectedCustomer.name || '',
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
    });
    setProfileError(null);
    setProfileEditing(true);
  };

  const cancelProfileEdit = () => {
    if (!selectedCustomer) return;
    setProfileDraft({
      name: selectedCustomer.name || '',
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
    });
    setProfileError(null);
    setProfileEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!selectedCustomer?.id || !canEditProfile) return;
    const name = profileDraft.name.trim();
    if (!name) {
      setProfileError('姓名不能为空');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      const saved = await updateCustProfile(selectedCustomer.id, {
        name,
        phone: profileDraft.phone.trim(),
        email: profileDraft.email.trim(),
      });
      syncCustomerFields(selectedCustomer.id, saved);
      setProfileDraft(saved);
      setProfileEditing(false);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : '更新客户信息失败');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangeCustomerStatus = async (status: string) => {
    if (!selectedCustomer?.id || !status) return;
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setStatusError('登录会话缺少 cli_abbr，请重新登录');
      return;
    }
    setStatusSaving(true);
    setStatusError(null);
    try {
      const saved = await updateCustStatus(cliAbbr, selectedCustomer.id, status);
      syncCustomerFields(selectedCustomer.id, { status: saved as Customer['status'] });
      void loadStatusStats();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : '更新状态失败');
    } finally {
      setStatusSaving(false);
    }
  };

  const syncCustomerTags = (custId: string, tags: string[]) => {
    setSelectedCustomer((prev) => (prev && prev.id === custId ? { ...prev, tags } : prev));
    setCustomers((prev) =>
      prev.map((c) => (c.id === custId ? { ...c, tags } : c))
    );
  };

  const openLabelPicker = async (event: React.MouseEvent<HTMLElement>) => {
    setLabelAnchorEl(event.currentTarget);
    setLabelError(null);
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setAvailableLabels([]);
      setLabelError('登录会话缺少 cli_abbr，请重新登录');
      return;
    }
    setLabelsLoading(true);
    try {
      const labels = await fetchCustLabels(cliAbbr);
      setAvailableLabels(labels);
      mergeLabelColors(labels);
    } catch (err) {
      setAvailableLabels([]);
      setLabelError(err instanceof Error ? err.message : '加载可用标签失败');
    } finally {
      setLabelsLoading(false);
    }
  };

  const closeLabelPicker = () => {
    setLabelAnchorEl(null);
    setNewLabelInput('');
    setNewLabelColor(DEFAULT_LABEL_COLOR);
    setLabelError(null);
  };

  const handleAddLabel = async (label: string, color?: string) => {
    if (!selectedCustomer?.id) return;
    const trimmed = label.trim();
    if (!trimmed) return;
    const cliAbbr = getSessionCliAbbr();
    if (!cliAbbr) {
      setLabelError('登录会话缺少 cli_abbr，请重新登录');
      return;
    }
    setAddingLabel(trimmed);
    setLabelError(null);
    try {
      const result = await addCustLabel(
        cliAbbr,
        selectedCustomer.id,
        trimmed,
        color || colorForLabel(trimmed)
      );
      syncCustomerTags(selectedCustomer.id, result.tags);
      mergeLabelColors([{ label: result.label, color: result.color }]);
      setAvailableLabels((prev) => {
        if (prev.some((item) => item.label === result.label)) {
          return prev.map((item) =>
            item.label === result.label ? { ...item, color: result.color } : item
          );
        }
        return [...prev, { label: result.label, color: result.color }].sort((a, b) =>
          a.label.localeCompare(b.label, 'zh-CN')
        );
      });
      setFilterLabelOptions((prev) =>
        prev.includes(result.label)
          ? prev
          : [...prev, result.label].sort((a, b) => a.localeCompare(b, 'zh-CN'))
      );
      setNewLabelInput('');
      setNewLabelColor(DEFAULT_LABEL_COLOR);
      void loadLabelStats();
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : '添加标签失败');
    } finally {
      setAddingLabel(null);
    }
  };

  const handleSaveSummary = async () => {
    if (!selectedCustomer?.id) return;
    const next = summaryDraft.trim().slice(0, MAX_SUMMARY_LEN);
    setSummarySaving(true);
    setSummaryError(null);
    try {
      const saved = await updateCustSummary(selectedCustomer.id, next);
      setSummaryDraft(saved);
      syncCustomerFields(selectedCustomer.id, { summary: saved });
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : '更新概要失败');
    } finally {
      setSummarySaving(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedCustomer?.id) return;
    const content = followUpDraft.trim();
    if (!content) return;
    const now = nowFollowUpDateTime();
    const date = followUpDate || now.date;
    const time = followUpTime || now.time;
    if (!date || !time) {
      setFollowUpError('请选择跟进日期和时间');
      return;
    }
    setFollowUpSaving(true);
    setFollowUpError(null);
    try {
      const user = getAuthUser();
      const createdAt = `${date} ${time}:00`;
      const followUps = await addCustFollowUp(
        selectedCustomer.id,
        content.slice(0, MAX_FOLLOW_UP_LEN),
        {
          createdBy: user?.name || user?.id || undefined,
          createdAt,
        }
      );
      syncCustomerFields(selectedCustomer.id, {
        followUps,
        lastContact: date,
      });
      setFollowUpDraft('');
      const reset = nowFollowUpDateTime();
      setFollowUpDate(reset.date);
      setFollowUpTime(reset.time);
    } catch (err) {
      setFollowUpError(err instanceof Error ? err.message : '添加跟进记录失败');
    } finally {
      setFollowUpSaving(false);
    }
  };

  const formatFollowUpAt = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value.replace(/-/g, '/'));
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /** List column: e.g. 3月20日：客户说自己已经处理完了 */
  const formatFollowUpListLine = (createdAt?: string, content?: string) => {
    const text = (content || '').trim() || '-';
    if (!createdAt) return text;
    const d = new Date(createdAt.replace(/-/g, '/'));
    if (Number.isNaN(d.getTime())) return text;
    return `${d.getMonth() + 1}月${d.getDate()}日：${text}`;
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
      case '活跃':
        return 'success';
      case 'pending':
      case '待处理':
        return 'warning';
      case 'inactive':
      case '未激活':
      case '非活跃':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'pending':
        return '待处理';
      case 'inactive':
        return '未激活';
      default:
        return status || '未知';
    }
  };

  const STATUS_RULER_COLORS = [
    '#388e3c',
    '#f57c00',
    '#d32f2f',
    '#1976d2',
    '#7b1fa2',
    '#00838f',
    '#5d4037',
    '#455a64',
  ] as const;

  const getStatusRulerColor = (status: string, index: number): string => {
    switch (status) {
      case 'active':
      case '活跃':
        return '#388e3c';
      case 'pending':
      case '待处理':
        return '#f57c00';
      case 'inactive':
      case '未激活':
      case '非活跃':
        return '#d32f2f';
      default:
        return STATUS_RULER_COLORS[index % STATUS_RULER_COLORS.length];
    }
  };

  const detailStatusOptions = (() => {
    const opts = [...statusOptions];
    if (!selectedCustomer) return opts;
    const current = getStatusText(selectedCustomer.status);
    if (current && current !== '未知' && !opts.includes(current) && !opts.includes(selectedCustomer.status)) {
      opts.push(current);
    }
    return opts;
  })();

  const selectedStatusValue = selectedCustomer
    ? detailStatusOptions.includes(getStatusText(selectedCustomer.status))
      ? getStatusText(selectedCustomer.status)
      : selectedCustomer.status || ''
    : '';

  const tagFilters = (() => {
    const byLabel = new Map(labelStats.map((stat) => [stat.label, stat]));
    const labels: string[] = [];
    const seen = new Set<string>();
    const push = (label: string) => {
      const name = label.trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      labels.push(name);
    };
    for (const label of filterLabelOptions) push(label);
    for (const stat of labelStats) push(stat.label);
    return labels.map((label) => {
      const stat = byLabel.get(label);
      return {
        label,
        count: stat?.count ?? 0,
        color: stat?.color?.trim() || colorForLabel(label),
      };
    });
  })();
  const tagRulerCount = 2 + tagFilters.length;
  const visibilityRulerCount = 2 + visibilityRoles.length;
  const statusRulerCount = statusStats.length + 1;
  const rulerColumns = Math.max(tagRulerCount, visibilityRulerCount, statusRulerCount);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          px: 2,
          py: 1.5,
          mb: 2,
          borderRadius: 2,
          mx: 2,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            minHeight: 36,
          }}
        >
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              fontSize: '1.5rem',
              lineHeight: '36px',
              height: 36,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            快捷选择
          </Typography>
          <Button
            id="add-customer-button"
            variant="contained"
            size="small"
            startIcon={<Edit />}
            aria-haspopup="menu"
            aria-controls={addMenuAnchor ? 'add-customer-menu' : undefined}
            aria-expanded={Boolean(addMenuAnchor)}
            sx={{
              borderRadius: 2,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              height: 36,
              minHeight: 36,
              px: 2,
            }}
            onClick={(event) => setAddMenuAnchor(event.currentTarget)}
          >
            更多功能
          </Button>
        </Box>
        <Menu
          id="add-customer-menu"
          anchorEl={addMenuAnchor}
          open={Boolean(addMenuAnchor)}
          onClose={() => setAddMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 168, mt: 0.5 } }}
        >
          <MenuItem
            onClick={() => {
              setAddMenuAnchor(null);
              navigate('/business/customers/new');
            }}
          >
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText>新增客户</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAddMenuAnchor(null);
              navigate('/business/customers/import');
            }}
          >
            <ListItemIcon>
              <UploadFile fontSize="small" />
            </ListItemIcon>
            <ListItemText>导入客户</ListItemText>
          </MenuItem>
          {canManageLabels && (
            <MenuItem
              onClick={() => {
                setAddMenuAnchor(null);
                navigate('/business/customers/labels');
              }}
            >
              <ListItemText inset>标签管理</ListItemText>
            </MenuItem>
          )}
          {canManageStatuses && (
            <MenuItem
              onClick={() => {
                setAddMenuAnchor(null);
                navigate('/business/customers/statuses');
              }}
            >
              <ListItemText inset>状态管理</ListItemText>
            </MenuItem>
          )}
        </Menu>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: rulerColumns > 0 ? `6em 8px repeat(${rulerColumns}, max-content)` : '6em',
          alignItems: 'stretch',
          rowGap: 1.5,
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        <Typography variant="body2" component="span" sx={{ ...quickFilterLabelSx, gridColumn: 1, gridRow: 1, alignSelf: 'center' }}>
          按标签
        </Typography>
        <Box
          title={`全部（${totalCust}）`}
          onClick={() => selectTagFilter('')}
          sx={(theme) => ({
            ...quickFilterButtonSx(theme.palette.primary.main, selectedTag === ''),
            ...rulerCellFrame(1, 0, tagRulerCount),
          })}
        >
          全部（{totalCust}）
        </Box>
        {tagFilters.map((stat, index) => (
          <Box
            key={stat.label}
            title={`${stat.label}（${stat.count}）`}
            onClick={() => selectTagFilter(stat.label)}
            sx={{
              ...quickFilterButtonSx(stat.color, selectedTag === stat.label),
              ...rulerCellFrame(1, index + 1, tagRulerCount),
            }}
          >
            {stat.label}（{stat.count}）
          </Box>
        ))}
        <Box
          title={`未标注（${untaggedCust}）`}
          onClick={() => selectTagFilter('__untagged__')}
          sx={(theme) => ({
            ...quickFilterButtonSx(theme.palette.grey[500], selectedTag === '__untagged__'),
            ...rulerCellFrame(1, tagFilters.length + 1, tagRulerCount),
          })}
        >
          未标注（{untaggedCust}）
        </Box>

        <Typography variant="body2" component="span" sx={{ ...quickFilterLabelSx, gridColumn: 1, gridRow: 2, alignSelf: 'center' }}>
          按可见范围
        </Typography>
        <Box
          title={`全部（${visibilityTotal}）`}
          onClick={() => selectVisibilityFilter('')}
          sx={(theme) => ({
            ...quickFilterButtonSx(theme.palette.primary.main, selectedVisibility === ''),
            ...rulerCellFrame(2, 0, visibilityRulerCount),
          })}
        >
          全部（{visibilityTotal}）
        </Box>
        <Box
          title={`所有角色（${unassignedCount}）`}
          onClick={() => selectVisibilityFilter(ALL_ROLES_ASSIGNEE_SCOPE)}
          sx={{
            ...quickFilterButtonSx(ALL_ROLES_COLOR, selectedVisibility === ALL_ROLES_ASSIGNEE_SCOPE),
            ...rulerCellFrame(2, 1, visibilityRulerCount),
          }}
        >
          所有角色（{unassignedCount}）
        </Box>
        {visibilityRoles.map((role, index) => {
          const color = FOLLOWER_COLORS[index % FOLLOWER_COLORS.length];
          const count = assigneeCounts[role.referenceId] ?? 0;
          return (
            <Box
              key={role.referenceId}
              title={`${role.name}（${count}）`}
              onClick={() => selectVisibilityFilter(role.referenceId)}
              sx={{
                ...quickFilterButtonSx(color, selectedVisibility === role.referenceId),
                ...rulerCellFrame(2, index + 2, visibilityRulerCount),
              }}
            >
              {role.name}（{count}）
            </Box>
          );
        })}

        <Typography variant="body2" component="span" sx={{ ...quickFilterLabelSx, gridColumn: 1, gridRow: 3, alignSelf: 'center' }}>
          按状态
        </Typography>
        <Box
          title={`全部（${totalCust}）`}
          onClick={() => selectStatusFilter('')}
          sx={(theme) => ({
            ...quickFilterButtonSx(theme.palette.primary.main, selectedStatus === ''),
            ...rulerCellFrame(3, 0, statusRulerCount),
          })}
        >
          全部（{totalCust}）
        </Box>
        {statusStats.map((stat, index) => {
          const color = getStatusRulerColor(stat.status, index);
          return (
            <Box
              key={stat.status}
              onClick={() => selectStatusFilter(stat.status)}
              title={`${stat.status}（${stat.count}）`}
              sx={{
                ...quickFilterButtonSx(color, selectedStatus === stat.status),
                ...rulerCellFrame(3, index + 1, statusRulerCount),
              }}
            >
              {stat.status}（{stat.count}）
            </Box>
          );
        })}
        {(selectedTag || selectedVisibility || selectedStatus) && (
          <>
            <Typography
              variant="body2"
              component="span"
              sx={{ ...quickFilterLabelSx, gridColumn: 1, gridRow: 4, alignSelf: 'center' }}
            >
              当前筛选
            </Typography>
            <Box
              sx={{
                gridColumn: '3 / -1',
                gridRow: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              {selectedTag && (
                <Chip
                  label={selectedTag === '__untagged__' ? '标签：未标注' : `标签：${selectedTag}`}
                  color="primary"
                  onDelete={() => selectTagFilter('')}
                />
              )}
              {selectedVisibility && (
                <Chip
                  label={
                    selectedVisibility === ALL_ROLES_ASSIGNEE_SCOPE
                      ? '可见范围：所有角色'
                      : `可见范围：${roleNameOf(selectedVisibility)}`
                  }
                  onDelete={() => selectVisibilityFilter('')}
                />
              )}
              {selectedStatus && (
                <Chip
                  label={`状态：${selectedStatus}`}
                  color="secondary"
                  onDelete={() => selectStatusFilter('')}
                />
              )}
            </Box>
          </>
        )}
      </Box>
      </Paper>

      <Paper
        elevation={3}
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ px: 2, py: 1.5, mb: 2, borderRadius: 2, mx: 2, minWidth: 0 }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', mb: 1.25 }}
        >
          组合查询
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
          }}
        >
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            overflowX: 'auto',
            pt: 1,
            pb: 0.5,
            '& .MuiInputLabel-root': { whiteSpace: 'nowrap' },
          }}
        >
          <Autocomplete
            multiple
            size="small"
            options={filterLabelOptions}
            value={draftFilters.tags}
            onChange={(_e, value) =>
              setDraftFilters((prev) => ({ ...prev, tags: value }))
            }
            renderInput={(params) => (
              <TextField {...params} label="标签" placeholder="可多选" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  size="small"
                  label={option}
                />
              ))
            }
            sx={{ width: 280, minWidth: 280, flex: '0 0 280px' }}
          />
          <TextField
            size="small"
            label="姓名"
            value={draftFilters.name}
            onChange={(e) =>
              setDraftFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ width: 140, minWidth: 140, flex: '0 0 140px' }}
          />
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
            <TextField
              size="small"
              label="添加日期起"
              type="date"
              value={draftFilters.registrationDateFrom}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  registrationDateFrom: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 168 }}
            />
            <Typography variant="body2" color="text.secondary">
              ~
            </Typography>
            <TextField
              size="small"
              label="添加日期止"
              type="date"
              value={draftFilters.registrationDateTo}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  registrationDateTo: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 168 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
            <TextField
              size="small"
              label="最后联系起"
              type="date"
              value={draftFilters.lastContactFrom}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  lastContactFrom: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 168 }}
            />
            <Typography variant="body2" color="text.secondary">
              ~
            </Typography>
            <TextField
              size="small"
              label="最后联系止"
              type="date"
              value={draftFilters.lastContactTo}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  lastContactTo: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 168 }}
            />
          </Box>
        </Box>
          <Button
            type="submit"
            variant="outlined"
            size="small"
            startIcon={<Search />}
            disabled={loading || statsLoading}
            sx={{
              borderRadius: 2,
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              height: 40,
              minHeight: 40,
              px: 2,
            }}
          >
            搜索
          </Button>
        </Box>
      </Paper>

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
        {batchError && (
          <Alert severity="error" sx={{ mx: 2, mt: 2 }} onClose={() => setBatchError(null)}>
            {batchError}
          </Alert>
        )}
        {batchMessage && (
          <Alert severity="success" sx={{ mx: 2, mt: 2 }} onClose={() => setBatchMessage(null)}>
            {batchMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            pt: 2,
            pb: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            已选 {selectedIds.length} 项
          </Typography>
          <Button size="small" variant="outlined" onClick={selectAllOnPage} disabled={pageIds.length === 0}>
            全选
          </Button>
          <Button size="small" variant="outlined" onClick={clearSelection} disabled={selectedIds.length === 0}>
            取消
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="customer-batch-action-label">批量操作</InputLabel>
            <Select
              labelId="customer-batch-action-label"
              label="批量操作"
              value={batchAction}
              onChange={(e) => handleBatchActionChange(String(e.target.value))}
              disabled={selectedIds.length === 0 || batchBusy}
            >
              <MenuItem value="assign">指派给角色</MenuItem>
              <MenuItem value="delete">删除</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={somePageSelected}
                    checked={allPageSelected}
                    onChange={toggleSelectAllOnPage}
                    disabled={pageIds.length === 0}
                    inputProps={{ 'aria-label': '全选本页' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>概要</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>客户信息</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>公司</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>标签</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>可见范围</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>跟进记录</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>添加日期</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">暂无客户数据</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    hover
                    selected={selectedIds.includes(customer.id)}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => toggleSelectOne(customer.id)}
                        inputProps={{ 'aria-label': `选择客户 ${customer.name}` }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          title={customer.summary || undefined}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: customer.summary ? 'text.primary' : 'grey.400',
                          }}
                        >
                          {customer.summary || '您可以编辑'}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label="编辑概要"
                          title="编辑"
                          onClick={() => handleViewCustomer(customer)}
                          sx={{ color: 'warning.main', flexShrink: 0, mt: -0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.25 }}>
                          {customer.phone || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                          {customer.email || '-'}
                        </Typography>
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
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, max-content)',
                          gap: 0.5,
                          maxWidth: 280,
                          alignItems: 'center',
                        }}
                      >
                        {(customer.tags || []).slice(0, 6).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={labelChipSx(colorForLabel(tag))}
                          />
                        ))}
                        {(customer.tags || []).length < 6 && (
                          <IconButton
                            size="small"
                            aria-label="添加标签"
                            onClick={() => handleViewCustomer(customer)}
                            sx={{
                              width: 28,
                              height: 28,
                              border: '1px dashed',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              borderRadius: 1,
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={followerLabel(customer.assignee)}
                        size="small"
                        variant="outlined"
                        title={followerLabel(customer.assignee)}
                        sx={followerChipSx(followerColor(customer.assignee))}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {(customer.followUps || []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        ) : (
                          (customer.followUps || []).slice(0, 3).map((item, idx) => {
                            const line = formatFollowUpListLine(item.createdAt, item.content);
                            return (
                              <Typography
                                key={`${customer.id}-fu-${idx}`}
                                variant="caption"
                                title={line}
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 220,
                                }}
                              >
                                {line}
                              </Typography>
                            );
                          })
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.registrationDate
                          ? new Date(customer.registrationDate).toLocaleDateString('zh-CN')
                          : '-'}
                      </Typography>
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
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        sx={{ color: 'primary.main' }}
                        title="查看详情"
                        aria-label={`查看 ${customer.name || customer.id}`}
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `第 ${from}-${to} 条，共 ${count} 条`}
        />
      </Paper>

      <Dialog open={assignDialogOpen} onClose={closeAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" component="div">
                选择角色
              </Typography>
              <Typography variant="body2" color="text.secondary">
                将已选的 {selectedIds.length} 个客户指派给一个角色
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => void loadRolesForAssign()}
              disabled={rolesLoading || batchBusy}
            >
              刷新
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 2, position: 'relative', minHeight: 180 }}>
          {batchError && assignDialogOpen && (
            <Alert severity="error" onClose={() => setBatchError(null)}>
              {batchError}
            </Alert>
          )}
          {rolesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {!rolesLoading && roleCatalog.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              暂无角色
            </Typography>
          )}
          {!rolesLoading &&
            roleCatalog.map((role) => {
              const selectable = Boolean(role.referenceId) && !batchBusy;
              const selected = assignRoleId === role.referenceId && role.referenceId !== '';
              return (
                <Box
                  key={role.referenceId || role.name}
                  role="button"
                  tabIndex={selectable ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={role.name}
                  onClick={() => {
                    if (selectable) setAssignRoleId(role.referenceId);
                  }}
                  onKeyDown={(event) => {
                    if (!selectable) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setAssignRoleId(role.referenceId);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: selectable ? 'pointer' : 'not-allowed',
                    opacity: selectable ? 1 : 0.55,
                    bgcolor: selected ? 'action.selected' : 'transparent',
                  }}
                >
                  <Radio
                    checked={selected}
                    disabled={!selectable}
                    onChange={() => setAssignRoleId(role.referenceId)}
                    onClick={(event) => event.stopPropagation()}
                    inputProps={{ 'aria-label': `选择角色 ${role.name}` }}
                  />
                  <Typography variant="body1">{role.name}</Typography>
                </Box>
              );
            })}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog} disabled={batchBusy}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleConfirmAssign()}
            disabled={batchBusy || !assignRoleId}
          >
            {batchBusy ? '指派中…' : '确认指派'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除已选的 {selectedIds.length} 个客户吗？此操作不可恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={batchBusy}>
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmDelete()}
            disabled={batchBusy}
          >
            {batchBusy ? '删除中…' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          if (detailDeleting) return;
          setDetailDialogOpen(false);
        }}
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      基本信息
                    </Typography>
                    {!profileEditing && (
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={startProfileEdit}
                        disabled={!canEditProfile}
                        title={canEditProfile ? '编辑姓名、电话、邮箱' : '无权限编辑客户信息'}
                      >
                        编辑
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      姓名
                    </Typography>
                    {profileEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={profileDraft.name}
                        onChange={(e) =>
                          setProfileDraft((prev) => ({
                            ...prev,
                            name: e.target.value.slice(0, MAX_CUST_NAME_LEN),
                          }))
                        }
                        inputProps={{ maxLength: MAX_CUST_NAME_LEN }}
                        disabled={profileSaving}
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1">{selectedCustomer.name}</Typography>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      公司
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.company}</Typography>
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
                    {profileEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={profileDraft.email}
                        onChange={(e) =>
                          setProfileDraft((prev) => ({
                            ...prev,
                            email: e.target.value.slice(0, MAX_CUST_EMAIL_LEN),
                          }))
                        }
                        inputProps={{ maxLength: MAX_CUST_EMAIL_LEN }}
                        disabled={profileSaving}
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1">{selectedCustomer.email || '-'}</Typography>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      电话
                    </Typography>
                    {profileEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={profileDraft.phone}
                        onChange={(e) =>
                          setProfileDraft((prev) => ({
                            ...prev,
                            phone: e.target.value.slice(0, MAX_CUST_PHONE_LEN),
                          }))
                        }
                        inputProps={{ maxLength: MAX_CUST_PHONE_LEN }}
                        disabled={profileSaving}
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1">{selectedCustomer.phone || '-'}</Typography>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      地址
                    </Typography>
                    <Typography variant="body1">{selectedCustomer.location}</Typography>
                  </Box>
                </Box>
              </Box>
              {profileError && (
                <Alert severity="error" sx={{ mt: 1 }} onClose={() => setProfileError(null)}>
                  {profileError}
                </Alert>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  状态
                </Typography>
                {detailStatusOptions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无可用状态
                  </Typography>
                ) : (
                  <Box
                    role="radiogroup"
                    aria-label="客户状态"
                    sx={{
                      display: 'flex',
                      width: '100%',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                      opacity: statusSaving ? 0.7 : 1,
                      pointerEvents: statusSaving ? 'none' : 'auto',
                    }}
                  >
                    {detailStatusOptions.map((option, index) => {
                      const selected = selectedStatusValue === option;
                      const color = getStatusRulerColor(option, index);
                      return (
                        <Box
                          key={option}
                          role="radio"
                          aria-checked={selected}
                          tabIndex={0}
                          onClick={() => void handleChangeCustomerStatus(option)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              void handleChangeCustomerStatus(option);
                            }
                          }}
                          title={option}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            position: 'relative',
                            px: 1,
                            py: 1.5,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: color,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            letterSpacing: 0.2,
                            filter: selected ? 'none' : 'saturate(0.75) brightness(0.92)',
                            boxShadow: selected
                              ? 'inset 0 0 0 2px rgba(255,255,255,0.95), inset 0 -3px 0 rgba(0,0,0,0.18)'
                              : 'inset 0 -2px 0 rgba(0,0,0,0.12)',
                            borderRight:
                              index < detailStatusOptions.length - 1
                                ? '1px solid rgba(255,255,255,0.35)'
                                : 'none',
                            '&::after': selected
                              ? {
                                  content: '""',
                                  position: 'absolute',
                                  left: '50%',
                                  bottom: 4,
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: '#fff',
                                  transform: 'translateX(-50%)',
                                }
                              : undefined,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {option}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {statusError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {statusError}
                  </Alert>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  标签
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {(selectedCustomer.tags || []).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={labelChipSx(colorForLabel(tag))}
                    />
                  ))}
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label="增加标签"
                    onClick={openLabelPicker}
                    disabled={Boolean(addingLabel)}
                    sx={{
                      border: '1px dashed',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                {labelError && !labelAnchorEl && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {labelError}
                  </Alert>
                )}
                <Popover
                  open={Boolean(labelAnchorEl)}
                  anchorEl={labelAnchorEl}
                  onClose={closeLabelPicker}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <Box sx={{ width: 300, p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      可用标签
                    </Typography>
                    {labelsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <List dense sx={{ maxHeight: 220, overflow: 'auto', py: 0 }}>
                        {availableLabels.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
                            暂无可用标签，可在下方新建
                          </Typography>
                        ) : (
                          availableLabels.map((item) => {
                            const already =
                              (selectedCustomer.tags || []).includes(item.label);
                            return (
                              <ListItemButton
                                key={item.label}
                                disabled={already || addingLabel === item.label}
                                onClick={() => void handleAddLabel(item.label, item.color)}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: item.color || DEFAULT_LABEL_COLOR,
                                    mr: 1.25,
                                    flexShrink: 0,
                                  }}
                                />
                                <ListItemText
                                  primary={item.label}
                                  secondary={already ? '已添加' : undefined}
                                />
                                {addingLabel === item.label && <CircularProgress size={16} />}
                              </ListItemButton>
                            );
                          })
                        )}
                      </List>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
                      新建标签颜色
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                      {LABEL_COLOR_OPTIONS.map((color) => (
                        <Box
                          key={color}
                          component="button"
                          type="button"
                          aria-label={`选择颜色 ${color}`}
                          onClick={() => setNewLabelColor(color)}
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: color,
                            border:
                              newLabelColor === color
                                ? '2px solid'
                                : '2px solid transparent',
                            borderColor:
                              newLabelColor === color ? 'text.primary' : 'transparent',
                            cursor: 'pointer',
                            p: 0,
                            outline: newLabelColor === color ? '2px solid' : 'none',
                            outlineColor: color,
                            outlineOffset: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Box
                      component="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleAddLabel(newLabelInput, newLabelColor);
                      }}
                      sx={{ display: 'flex', gap: 1 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="新建标签"
                        value={newLabelInput}
                        onChange={(e) => setNewLabelInput(e.target.value)}
                        inputProps={{ maxLength: 64 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={!newLabelInput.trim() || Boolean(addingLabel)}
                        sx={{ bgcolor: newLabelColor, '&:hover': { bgcolor: newLabelColor } }}
                      >
                        添加
                      </Button>
                    </Box>
                    {labelError && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {labelError}
                      </Alert>
                    )}
                  </Box>
                </Popover>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  概要
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  size="small"
                  placeholder="最多 100 个字符"
                  value={summaryDraft}
                  onChange={(e) =>
                    setSummaryDraft(e.target.value.slice(0, MAX_SUMMARY_LEN))
                  }
                  inputProps={{ maxLength: MAX_SUMMARY_LEN }}
                  helperText={`${summaryDraft.length}/${MAX_SUMMARY_LEN}`}
                />
                {summaryError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {summaryError}
                  </Alert>
                )}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={
                      summarySaving ||
                      summaryDraft.trim() === (selectedCustomer.summary || '').trim()
                    }
                    onClick={() => void handleSaveSummary()}
                  >
                    {summarySaving ? '保存中…' : '保存概要'}
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  跟进记录
                </Typography>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleAddFollowUp();
                  }}
                  sx={{
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap',
                      px: 1.5,
                      py: 1,
                      bgcolor: 'grey.50',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      跟进时间
                    </Typography>
                    <TextField
                      size="small"
                      type="date"
                      value={followUpDate}
                      onFocus={ensureFollowUpDateTimeDefaults}
                      onClick={ensureFollowUpDateTimeDefaults}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      variant="standard"
                      sx={{ width: 150, '& .MuiInput-underline:before': { borderBottomColor: 'transparent' } }}
                    />
                    <TextField
                      size="small"
                      type="time"
                      value={followUpTime}
                      onFocus={ensureFollowUpDateTimeDefaults}
                      onClick={ensureFollowUpDateTimeDefaults}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      variant="standard"
                      sx={{ width: 110, '& .MuiInput-underline:before': { borderBottomColor: 'transparent' } }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    placeholder="记录本次跟进内容…"
                    value={followUpDraft}
                    onChange={(e) =>
                      setFollowUpDraft(e.target.value.slice(0, MAX_FOLLOW_UP_LEN))
                    }
                    inputProps={{ maxLength: MAX_FOLLOW_UP_LEN }}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      px: 1.5,
                      pt: 1.25,
                      '& .MuiInputBase-root': { alignItems: 'flex-start' },
                      '& textarea': { lineHeight: 1.6 },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      borderTop: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {followUpDraft.length}/{MAX_FOLLOW_UP_LEN}
                    </Typography>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={
                        !followUpDraft.trim() ||
                        !followUpDate ||
                        !followUpTime ||
                        followUpSaving
                      }
                      sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                    >
                      {followUpSaving ? '提交中…' : '添加跟进'}
                    </Button>
                  </Box>
                </Box>
                {followUpError && (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {followUpError}
                  </Alert>
                )}
                {(selectedCustomer.followUps || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无跟进记录
                  </Typography>
                ) : (
                  <Box sx={{ position: 'relative', pl: 2.5 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 7,
                        top: 8,
                        bottom: 8,
                        width: 2,
                        bgcolor: 'divider',
                      }}
                    />
                    {(selectedCustomer.followUps || []).map((item, idx) => (
                      <Box
                        key={`${item.createdAt}-${idx}`}
                        sx={{
                          position: 'relative',
                          pl: 2,
                          pb: idx === (selectedCustomer.followUps || []).length - 1 ? 0 : 2,
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -14,
                            top: 6,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            border: '2px solid',
                            borderColor: 'background.paper',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatFollowUpAt(item.createdAt)}
                          {item.createdBy ? ` · ${item.createdBy}` : ''}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.25, whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
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
                      添加日期
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
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          {profileEditing ? (
            <Box />
          ) : (
            <Button
              color="error"
              startIcon={<Delete />}
              onClick={() => {
                setDetailDeleteError(null);
                setDetailDeleteOpen(true);
              }}
              disabled={!selectedCustomer || detailDeleting}
            >
              删除
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {profileEditing ? (
              <>
                <Button onClick={cancelProfileEdit} disabled={profileSaving}>
                  取消
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSaveProfile()}
                  disabled={profileSaving || !profileDraft.name.trim()}
                >
                  {profileSaving ? '保存中…' : '保存'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setProfileEditing(false);
                    setProfileError(null);
                    setDetailDialogOpen(false);
                  }}
                  disabled={detailDeleting}
                >
                  关闭
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={startProfileEdit}
                  disabled={!canEditProfile || detailDeleting}
                  title={canEditProfile ? undefined : '无权限编辑客户信息'}
                >
                  编辑客户
                </Button>
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDeleteOpen}
        onClose={() => {
          if (detailDeleting) return;
          setDetailDeleteOpen(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除客户「{selectedCustomer?.name || selectedCustomer?.id}」吗？此操作不可恢复。
          </DialogContentText>
          {detailDeleteError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setDetailDeleteError(null)}>
              {detailDeleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDeleteOpen(false)} disabled={detailDeleting}>
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteDetailCustomer()}
            disabled={detailDeleting || !selectedCustomer}
          >
            {detailDeleting ? '删除中…' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerListPage;
