import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, HeldOrder, Product, ProductVariant } from '@/types';
import { useApp } from '@/context/AppContext';
import { playSound } from '@/utils/formatters';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  updateItemDiscount: (itemId: string, discountType?: 'percent' | 'fixed', discountValue?: number) => void;
  clearCart: () => void;

  orderNotes: string;
  setOrderNotes: (notes: string) => void;

  customDiscount: { type: 'percent' | 'fixed'; value: number };
  setCustomDiscount: (disc: { type: 'percent' | 'fixed'; value: number }) => void;

  // Held Orders
  heldOrders: HeldOrder[];
  holdCurrentOrder: (note?: string) => void;
  restoreHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;

  // Totals
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  totalCost: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOutlet, soundEnabled, showToast } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [customDiscount, setCustomDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({
    type: 'percent',
    value: 0,
  });
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const itemPrice = variant ? variant.price : product.price;
    const itemSku = variant ? variant.sku : product.sku;
    const uniqueKey = variant ? `${product.id}_${variant.id}` : product.id;

    // Check available stock
    const currentStock = product.stocks[activeOutlet.id] || 0;
    const existingItem = cart.find((i) => i.id === uniqueKey);
    const requestedQty = (existingItem?.quantity || 0) + quantity;

    if (currentStock <= 0) {
      showToast('warning', `Stok ${product.name} habis di outlet ini!`);
    }

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === uniqueKey);
      if (idx >= 0) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + quantity;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          subtotal: newQty * itemPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: uniqueKey,
          productId: product.id,
          productName: product.name,
          sku: itemSku,
          price: itemPrice,
          costPrice: product.costPrice,
          quantity,
          unit: product.unit,
          selectedVariant: variant,
          subtotal: quantity * itemPrice,
        };
        return [...prev, newItem];
      }
    });

    if (soundEnabled) playSound('beep');
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: qty,
              subtotal: qty * item.price,
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const updateItemDiscount = (
    itemId: string,
    discountType?: 'percent' | 'fixed',
    discountValue?: number
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let itemSub = item.quantity * item.price;
          if (discountType === 'percent' && discountValue) {
            itemSub -= (itemSub * discountValue) / 100;
          } else if (discountType === 'fixed' && discountValue) {
            itemSub = Math.max(0, itemSub - discountValue);
          }
          return {
            ...item,
            discountType,
            discountValue,
            subtotal: itemSub,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes('');
    setCustomDiscount({ type: 'percent', value: 0 });
  };

  // Held Orders
  const holdCurrentOrder = (note?: string) => {
    if (cart.length === 0) {
      showToast('warning', 'Keranjang belanja masih kosong!');
      return;
    }
    const orderNumber = `HOLD-${String(heldOrders.length + 1).padStart(3, '0')}`;
    const newHold: HeldOrder = {
      id: `hold_${Date.now()}`,
      orderNumber,
      items: [...cart],
      createdAt: new Date().toISOString(),
      note: note || orderNotes,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    showToast('info', `Pesanan ${orderNumber} berhasil diparkir/disimpan.`);
  };

  const restoreHeldOrder = (orderId: string) => {
    const hold = heldOrders.find((h) => h.id === orderId);
    if (!hold) return;
    setCart(hold.items);
    setOrderNotes(hold.note || '');
    setHeldOrders((prev) => prev.filter((h) => h.id !== orderId));
    showToast('success', `Pesanan ${hold.orderNumber} dibuka kembali.`);
  };

  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== orderId));
    showToast('info', 'Pesanan parkir telah dihapus.');
  };

  // Calculations
  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const rawSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [cart]);

  const totalCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  }, [cart]);

  const discountTotal = useMemo(() => {
    let disc = 0;
    // Custom discount
    if (customDiscount.value > 0) {
      if (customDiscount.type === 'percent') {
        disc += (rawSubtotal * customDiscount.value) / 100;
      } else {
        disc += customDiscount.value;
      }
    }
    return Math.min(rawSubtotal, disc);
  }, [rawSubtotal, customDiscount]);

  const subtotal = rawSubtotal;

  const grandTotal = Math.max(0, subtotal - discountTotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        updateItemNotes,
        updateItemDiscount,
        clearCart,
        orderNotes,
        setOrderNotes,
        customDiscount,
        setCustomDiscount,
        heldOrders,
        holdCurrentOrder,
        restoreHeldOrder,
        deleteHeldOrder,
        itemCount,
        subtotal,
        discountTotal,
        grandTotal,
        totalCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
