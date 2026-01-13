import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CityState {
  currentCity: string;
  setCity: (city: string) => void;
}

// Список доступных городов (для MVP хардкод, потом можно брать с бэка)
export const AVAILABLE_CITIES = ['Екатеринбург', 'Москва', 'Санкт-Петербург', 'Новосибирск', 'Все города'];

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      currentCity: 'Екатеринбург', // Дефолтный город (или "Все города")
      setCity: (city) => set({ currentCity: city }),
    }),
    {
      name: 'mario-city-storage',
    }
  )
);