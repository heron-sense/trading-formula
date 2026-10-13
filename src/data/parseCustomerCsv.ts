import type { Customer, CustomerStatus } from '../models';

const STATUS_SET = new Set<CustomerStatus>(['active', 'inactive', 'pending']);

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

const HEADER_ALIASES: Record<string, keyof Customer> = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  status: 'status',
  location: 'location',
  registration_date: 'registrationDate',
  registrationdate: 'registrationDate',
  last_contact: 'lastContact',
  lastcontact: 'lastContact',
  avatar: 'avatar',
};

export function parseCustomerCsv(text: string): Customer[] {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV 至少需要表头和一行数据');
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const fieldIndex: Partial<Record<keyof Customer, number>> = {};
  headers.forEach((h, idx) => {
    const key = HEADER_ALIASES[h];
    if (key) fieldIndex[key] = idx;
  });

  if (fieldIndex.name === undefined) {
    throw new Error('CSV 缺少必填列 name');
  }
  if (fieldIndex.id === undefined) {
    throw new Error('CSV 缺少必填列 id');
  }

  const rows: Customer[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const get = (key: keyof Customer): string => {
      const idx = fieldIndex[key];
      if (idx === undefined) return '';
      return (cells[idx] ?? '').trim();
    };

    const statusRaw = get('status') || 'pending';
    const status = (STATUS_SET.has(statusRaw as CustomerStatus)
      ? statusRaw
      : 'pending') as CustomerStatus;

    rows.push({
      id: get('id'),
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      company: get('company'),
      status,
      location: get('location'),
      registrationDate: get('registrationDate'),
      lastContact: get('lastContact'),
      avatar: get('avatar') || undefined,
    });
  }

  if (rows.length === 0) {
    throw new Error('CSV 没有有效数据行');
  }
  return rows;
}
