import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Receipt,
  Menu,
  X,
  Boxes,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AppView } from '@/types';

interface MenuModule {
  id: AppView;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, products } = useApp();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navs: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'pos', label: 'POS Kasir', icon: ShoppingCart, badge: totalCartCount > 0 ? totalCartCount : undefined },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
  ];

  const allModules: MenuModule[] = [
    { id: 'landing', label: 'Ringkasan / Home', category: 'Umum', icon: Sparkles },
    { id: 'pos', label: 'Terminal POS Kasir', category: 'Penjualan', icon: ShoppingCart },
    { id: 'transactions', label: 'Riwayat Transaksi', category: 'Penjualan', icon: Receipt },
    { id: 'products', label: 'Master Produk & SKU', category: 'Inventori', icon: Package },
    { id: 'inventory', label: 'Stok Opname & Mutasi', category: 'Inventori', icon: Boxes },
    { id: 'dashboard', label: 'Dashboard Analitik', category: 'Laporan & Keuangan', icon: LayoutDashboard },
    { id: 'reports', label: 'Laporan Laba Rugi (P&L)', category: 'Laporan & Keuangan', icon: BarChart3 },
    { id: 'audit', label: 'Audit Log Keamanan', category: 'Pengaturan & Toko', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan Toko & Printer', category: 'Pengaturan & Toko', icon: Settings },
  ];

  const allowedModules = allModules;

  const handleSelectModule = (viewId: AppView) => {
    setCurrentView(viewId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#fcfbf8]/95 dark:bg-[#181b20]/95 border-t border-[#e2ded6] dark:border-[#2e3542] backdrop-blur-md flex items-center justify-around px-2 z-40 select-none">
        {navs.map((nav) => {
          const Icon = nav.icon;
          const isActive = currentView === nav.id;

          return (
            <button
              key={nav.id}
              onClick={() => setCurrentView(nav.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all min-h-[44px] cursor-pointer ${
                isActive
                  ? 'text-[#1a1d24] dark:text-[#f4f2ec] font-black'
                  : 'text-[#6c7585] dark:text-[#8d96a6] font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                {nav.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                    {nav.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{nav.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#1f232b] dark:bg-[#f5f4ef]" />
              )}
            </button>
          );
        })}

        {/* Menu drawer trigger */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all min-h-[44px] cursor-pointer ${
            isMenuOpen
              ? 'text-[#1a1d24] dark:text-[#f4f2ec] font-black'
              : 'text-[#6c7585] dark:text-[#8d96a6] font-medium'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Semua Modul</span>
        </button>
      </nav>

      {/* Full Module Drawer Sheet on Mobile / Tablet */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#14171c]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="relative z-10 w-full bg-[#fcfbf8] dark:bg-[#1c2026] rounded-t-3xl border-t border-[#e2ded6] dark:border-[#2e3542] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#e2ded6] dark:border-[#2e3542] flex items-center justify-between bg-[#f7f6f2] dark:bg-[#181b20] shrink-0">
              <div>
                <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                  Semua Modul My Kasir Gweh ERP
                </h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-[#6c7585] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="p-4 overflow-y-auto space-y-4 pb-20">
              {['Penjualan', 'Inventori', 'Laporan & Keuangan', 'Pengaturan & Toko', 'Umum'].map((category) => {
                const categoryModules = allowedModules.filter((m) => m.category === category);
                if (categoryModules.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#7a8394] px-1">
                      {category}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categoryModules.map((module) => {
                        const Icon = module.icon;
                        const isCurrent = currentView === module.id;

                        return (
                          <button
                            key={module.id}
                            onClick={() => handleSelectModule(module.id)}
                            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all min-h-[50px] active:scale-95 cursor-pointer ${
                              isCurrent
                                ? 'bg-[#1f232b] text-[#f7f6f2] border-[#1f232b] dark:bg-[#f5f4ef] dark:text-[#181b21] dark:border-[#f5f4ef]'
                                : 'bg-[#f7f6f2] dark:bg-[#20252e] border-[#e2ded6] dark:border-[#2e3542] text-[#1a1d24] dark:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#282f3a]'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isCurrent ? 'bg-white/10 text-current' : 'bg-[#efece6] text-[#2c323e] dark:bg-[#282f3b] dark:text-[#e4e1d8]'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold leading-tight">{module.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
