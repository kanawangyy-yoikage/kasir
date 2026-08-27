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
    name: 'Outlet Pusat (Sudirman)',
    code: 'SDR-01',
    address: 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat',
    phone: '0812-8888-0101',
    isMain: true,
    taxRate: 0.11,
    serviceFeeRate: 0.05,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Budi Santoso',
    email: 'budi.owner@matchadesu.id',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
  name: 'My Kasir Gweh Coffee & Eatery',
  tagline: 'Kopi & Makanan Nusantara Berkualitas',
  address: 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat 10220',
  phone: '0812-8888-0101',
  email: 'info@matchadesu.id',
  website: 'https://matchadesu.id',
  taxEnabled: true,
  taxRate: 0.11, // 11% PB1 / PPN
  serviceFeeEnabled: true,
  serviceFeeRate: 0.05, // 5% Service Charge
  currency: 'IDR',
  receiptHeader: 'MY KASIR GWEH COFFEE & EATERY\nOutlet Sudirman Jakarta\nNPWP: 01.234.567.8-012.000',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nFollow Instagram: @matchadesu.id\nWifi: My Kasir Gweh_Guest (Pass: kopienak)',
  paperWidth: '58mm',
  enableSound: true,
  autoPrintReceipt: false,
  pointsPerRupiah: 10000,
  pointRedemptionRate: 100,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_EXPENSES: Expense[] = [];
