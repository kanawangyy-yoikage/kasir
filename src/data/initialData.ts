import {
  Outlet,
  Category,
  Product,
  Transaction,
  User,
  StoreSettings,
  AuditLog,
} from '@/types';

export const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 'out_1',
    name: '',
    code: '',
    address: '',
    phone: '',
    isMain: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: '',
    email: '',
    role: 'OWNER',
    outletId: 'out_1',
    pin: '1234',
  },
];

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  name: '',
  tagline: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  currency: 'IDR',
  receiptHeader: '',
  receiptFooter: '',
  paperWidth: '58mm',
  enableSound: true,
  autoPrintReceipt: false,
  pointsPerRupiah: 10000,
  pointRedemptionRate: 100,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
