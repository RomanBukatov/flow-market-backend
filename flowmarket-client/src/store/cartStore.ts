import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Чтобы корзина сохранялась после обновления страницы
import type { Product } from '../types/catalog';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === product.id);

        if (existingItem) {
          // Если товар уже есть - увеличиваем количество
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          // Если нет - добавляем
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      decreaseItem: (productId) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === productId);

        if (existingItem) {
          if (existingItem.quantity > 1) {
            // Уменьшаем на 1
            set({
              items: items.map((i) =>
                i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
              ),
            });
          } else {
            // Если 1, то удаляем совсем
            set({ items: items.filter((i) => i.id !== productId) });
          }
        }
      },

      removeFromCart: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'mario-cart-storage', // Имя ключа в localStorage
    }
  )
);
