import {
  Outlet,
  Category,
  Product,
  Supplier,
  PurchaseOrder,
  Customer,
  Shift,
  Promotion,
  Transaction,
  User,
  StoreSettings,
  AuditLog,
  Expense,
} from '@/types';

export const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 'out_1',
    name: '',
    code: '',
    address: '',
    phone: '',
    isMain: true,
    taxRate: 0.11,
    serviceFeeRate: 0.05,
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

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_PROMOTIONS: Promotion[] = [];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  name: '',
  tagline: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  taxEnabled: false,
  taxRate: 0.11, // 11% PB1 / PPN (dinonaktifkan default — tidak ada pajak)
  serviceFeeEnabled: false,
  serviceFeeRate: 0.05, // 5% Service Charge (dinonaktifkan default — tidak ada biaya layanan)
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

export const INITIAL_EXPENSES: Expense[] = [];
