import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppView,
  AuditLog,
  Category,
  Outlet,
  Product,
  Role,
  StockMutation,
  StockOpname,
  StoreSettings,
  ToastMessage,
  Transaction,
  User,
} from '@/types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_OUTLETS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '@/data/initialData';
import { playSound } from '@/utils/formatters';

interface AppContextType {
  // Navigation & User
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User;

  // Outlets
  outlets: Outlet[];
  activeOutlet: Outlet;
  setActiveOutlet: (outlet: Outlet) => void;
  addOutlet: (outlet: Omit<Outlet, 'id'>) => void;
  updateOutlet: (id: string, outlet: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // Inventory & Stock
  updateProductStock: (productId: string, outletId: string, newQuantity: number, reason: string) => void;
  transferStock: (productId: string, fromOutletId: string, toOutletId: string, quantity: number, notes?: string) => void;
  stockOpnames: StockOpname[];
  submitStockOpname: (opname: Omit<StockOpname, 'id'>) => void;
  stockMutations: StockMutation[];

  // Transactions & Sales
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  refundTransaction: (id: string, reason: string) => void;
  voidTransaction: (id: string, reason: string) => void;

  // Settings & Audit
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;

  // Database Backup & Restore
  backupDatabaseJSON: () => string;
  restoreDatabaseJSON: (jsonStr: string) => boolean;

  // UI States
  soundEnabled: boolean;
  toggleSound: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning' | string, message?: string, title?: string) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<User>(() => INITIAL_USERS[0]); // Single Owner
  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    const saved = localStorage.getItem('kasirku_outlets');
    return saved ? JSON.parse(saved) : INITIAL_OUTLETS;
  });
  const [activeOutlet, setActiveOutlet] = useState<Outlet>(() => outlets[0] || INITIAL_OUTLETS[0]);

  // Data states with initial mock data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kasirku_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_opnames');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMutations, setStockMutations] = useState<StockMutation[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_mutations');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kasirku_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kasirku_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kasirku_outlets', JSON.stringify(outlets));
  }, [outlets]);

  useEffect(() => {
    localStorage.setItem('kasirku_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kasirku_settings', JSON.stringify(settings));
  }, [settings]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const showToast = (
    typeOrMsg: 'success' | 'error' | 'info' | 'warning' | string,
    message?: string,
    title?: string
  ) => {
    let finalType: 'success' | 'error' | 'info' | 'warning' = 'info';
    let finalMsg = '';

    const validTypes = ['success', 'error', 'info', 'warning'];
    if (validTypes.includes(typeOrMsg)) {
      finalType = typeOrMsg as 'success' | 'error' | 'info' | 'warning';
      finalMsg = message || '';
    } else {
      finalMsg = typeOrMsg;
      if (message && validTypes.includes(message)) {
        finalType = message as 'success' | 'error' | 'info' | 'warning';
      }
    }

    const id = `tst_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, type: finalType, title, message: finalMsg };
    setToasts((prev) => [...prev, newToast]);

    if (soundEnabled) {
      if (finalType === 'success') playSound('success');
      else if (finalType === 'error') playSound('error');
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const log: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = { ...prodData, id };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('CREATE_PRODUCT', 'PRODUCTS', `Menambahkan produk baru: ${newProduct.name} (${newProduct.sku})`);
    showToast('success', `Produk ${newProduct.name} berhasil disimpan!`);
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodData } : p))
    );
    addAuditLog('UPDATE_PRODUCT', 'PRODUCTS', `Memperbarui data produk ID: ${id}`);
    showToast('success', 'Perubahan produk berhasil disimpan!');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('DELETE_PRODUCT', 'PRODUCTS', `Menghapus produk: ${prod?.name || id}`);
    showToast('info', 'Produk berhasil dihapus');
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const id = `cat_${Date.now()}`;
    const newCat: Category = { ...catData, id };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CREATE_CATEGORY', 'PRODUCTS', `Menambahkan kategori: ${newCat.name}`);
    showToast('success', `Kategori ${newCat.name} berhasil dibuat!`);
  };

  // Stock Management
  const updateProductStock = (productId: string, outletId: string, newQuantity: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const oldQty = prod.stocks[outletId] || 0;
    const diff = newQuantity - oldQty;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [outletId]: newQuantity,
            },
          };
        }
        return p;
      })
    );

    const mutation: StockMutation = {
      id: `mut_${Date.now()}`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId,
      outletName: outlets.find((o) => o.id === outletId)?.name || 'Outlet',
      type: 'ADJUSTMENT',
      quantityChange: diff,
      previousStock: oldQty,
      newStock: newQuantity,
      actorName: user.name,
      notes: reason,
    };
    setStockMutations((prev) => [mutation, ...prev]);
    addAuditLog('STOCK_ADJUST', 'INVENTORY', `Penyesuaian stok ${prod.name}: ${oldQty} -> ${newQuantity} (${reason})`);
    showToast('success', `Stok ${prod.name} diperbarui menjadi ${newQuantity}`);
  };

  const transferStock = (productId: string, fromOutletId: string, toOutletId: string, quantity: number, notes?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentFrom = prod.stocks[fromOutletId] || 0;
    if (currentFrom < quantity) {
      showToast('error', 'Stok di outlet asal tidak mencukupi untuk transfer!');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [fromOutletId]: (p.stocks[fromOutletId] || 0) - quantity,
              [toOutletId]: (p.stocks[toOutletId] || 0) + quantity,
            },
          };
        }
        return p;
      })
    );

    const fromName = outlets.find((o) => o.id === fromOutletId)?.name || 'Outlet Asal';
    const toName = outlets.find((o) => o.id === toOutletId)?.name || 'Outlet Tujuan';

    const outMutation: StockMutation = {
      id: `mut_${Date.now()}_out`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId: fromOutletId,
      outletName: fromName,
      type: 'TRANSFER_OUT',
      quantityChange: -quantity,
      previousStock: currentFrom,
      newStock: currentFrom - quantity,
      actorName: user.name,
      notes: `Transfer ke ${toName}. ${notes || ''}`,
    };

    const inMutation: StockMutation = {
      id: `mut_${Date.now()}_in`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId: toOutletId,
      outletName: toName,
      type: 'TRANSFER_IN',
      quantityChange: quantity,
      previousStock: prod.stocks[toOutletId] || 0,
      newStock: (prod.stocks[toOutletId] || 0) + quantity,
      actorName: user.name,
      notes: `Diterima dari ${fromName}. ${notes || ''}`,
    };

    setStockMutations((prev) => [inMutation, outMutation, ...prev]);
    addAuditLog('TRANSFER_STOCK', 'INVENTORY', `Transfer ${quantity} ${prod.unit} ${prod.name} dari ${fromName} ke ${toName}`);
    showToast('success', `Transfer ${quantity} ${prod.name} ke ${toName} berhasil!`);
  };

  const submitStockOpname = (opnameData: Omit<StockOpname, 'id'>) => {
    const id = `opn_${Date.now()}`;
    const newOpname: StockOpname = { ...opnameData, id };
    setStockOpnames((prev) => [newOpname, ...prev]);

    // Apply physical count to products
    opnameData.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            return {
              ...p,
              stocks: {
                ...p.stocks,
                [opnameData.outletId]: item.physicalStock,
              },
            };
          }
          return p;
        })
      );
    });

    addAuditLog('STOCK_OPNAME', 'INVENTORY', `Stock Opname ${newOpname.outletName}: Selisih biaya ${newOpname.totalDiscrepancyCost}`);
    showToast('success', 'Audit Stock Opname berhasil disimpan dan stok disinkronkan!');
  };

  // Transactions
  const addTransaction = (trxData: Omit<Transaction, 'id'>): Transaction => {
    const id = `trx_${Date.now()}`;
    const newTrx: Transaction = { ...trxData, id };
    setTransactions((prev) => [newTrx, ...prev]);

    // Deduct stock for each cart item
    newTrx.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            const current = p.stocks[newTrx.outletId] || 0;
            return {
              ...p,
              stocks: {
                ...p.stocks,
                [newTrx.outletId]: Math.max(0, current - item.quantity),
              },
            };
          }
          return p;
        })
      );
    });

    addAuditLog('TRANSACTION', 'POS', `Transaksi ${newTrx.invoiceNumber} senilai ${newTrx.total} (${newTrx.payment.method})`);
    return newTrx;
  };

  const refundTransaction = (id: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'REFUNDED', notes: reason };
        }
        return t;
      })
    );
    addAuditLog('REFUND_TRANSACTION', 'POS', `Refund transaksi ID ${id}: ${reason}`);
    showToast('info', 'Transaksi berhasil di-refund.');
  };

  const voidTransaction = (id: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'VOIDED', notes: reason };
        }
        return t;
      })
    );
    addAuditLog('VOID_TRANSACTION', 'POS', `Void transaksi ID ${id}: ${reason}`);
    showToast('warning', 'Transaksi telah di-void / dibatalkan.');
  };

  // Outlets CRUD
  const addOutlet = (outletData: Omit<Outlet, 'id'>) => {
    const newOutlet: Outlet = {
      ...outletData,
      id: `out_${Date.now()}`,
    };
    setOutlets((prev) => [...prev, newOutlet]);
    addAuditLog('CREATE_OUTLET', 'OUTLET', `Tambah cabang baru: ${newOutlet.name} (${newOutlet.code})`);
    showToast('success', `Cabang ${newOutlet.name} berhasil ditambahkan!`);
  };

  const updateOutlet = (id: string, data: Partial<Outlet>) => {
    setOutlets((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...data };
          if (activeOutlet.id === id) {
            setActiveOutlet(updated);
          }
          return updated;
        }
        return o;
      })
    );
    addAuditLog('UPDATE_OUTLET', 'OUTLET', `Perbarui informasi cabang ID: ${id}`);
    showToast('success', 'Data cabang outlet berhasil diperbarui!');
  };

  const deleteOutlet = (id: string) => {
    if (outlets.length <= 1) {
      showToast('error', 'Tidak dapat menghapus cabang terakhir!');
      return;
    }
    const remaining = outlets.filter((o) => o.id !== id);
    setOutlets(remaining);
    if (activeOutlet.id === id) {
      setActiveOutlet(remaining[0]);
    }
    addAuditLog('DELETE_OUTLET', 'OUTLET', `Menghapus cabang ID: ${id}`);
    showToast('info', 'Cabang outlet telah dihapus.');
  };

  // Category CRUD
  const updateCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    showToast('success', `Kategori berhasil diubah menjadi "${name}"`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Kategori produk dihapus.');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'Mengubah pengaturan toko & struk');
    showToast('success', 'Pengaturan toko berhasil disimpan!');
  };

  // JSON Database Backup & Restore
  const backupDatabaseJSON = () => {
    const fullDb = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      developer: 'matchadesu_',
      app: 'My Kasir Gweh POS & ERP UMKM',
      outlets,
      products,
      categories,
      transactions,
      settings,
      stockOpnames,
      stockMutations,
      auditLogs,
    };
    return JSON.stringify(fullDb, null, 2);
  };

  const restoreDatabaseJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.outlets && Array.isArray(data.outlets)) setOutlets(data.outlets);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.settings) setSettings(data.settings);
      showToast('success', 'Database berhasil dipulihkan dari cadangan JSON!');
      return true;
    } catch {
      showToast('error', 'Format file cadangan JSON tidak valid!');
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(INITIAL_USERS[0]);
    setOutlets(INITIAL_OUTLETS);
    setActiveOutlet(INITIAL_OUTLETS[0]);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStockOpnames([]);
    setStockMutations([]);
    showToast('info', 'Data toko berhasil di-reset ke nilai awal default!');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        user,
        outlets,
        activeOutlet,
        setActiveOutlet,
        addOutlet,
        updateOutlet,
        deleteOutlet,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProductStock,
        transferStock,
        stockOpnames,
        submitStockOpname,
        stockMutations,
        transactions,
        addTransaction,
        refundTransaction,
        voidTransaction,
        settings,
        updateSettings,
        auditLogs,
        addAuditLog,
        backupDatabaseJSON,
        restoreDatabaseJSON,
        soundEnabled,
        toggleSound,
        darkMode,
        toggleDarkMode,
        toasts,
        showToast,
        removeToast,
        resetAllData,
        resetToInitialData: resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
