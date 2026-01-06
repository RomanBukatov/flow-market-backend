import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd' // Провайдер темы
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // React Query
import App from './App'
import './index.css'

// Настройка React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Не обновлять при переключении вкладок
      retry: 1,
    },
  },
})

// Настройка Темы "Mario"
const marioTheme = {
  token: {
    colorPrimary: '#ff4d4f', // Яркий красный (как кепка Марио)
    borderRadius: 16,        // Сильные скругления (Claymorphism)
    fontFamily: 'Inter, system-ui, sans-serif',
    colorBgLayout: '#f0f2f5', // Светлый фон
  },
  components: {
    Button: {
      colorPrimary: '#ff4d4f',
      algorithm: true, // Включить алгоритмы генерации оттенков
      fontWeight: 700,
      boxShadow: '0 4px 0 #b3202d', // "Толстая" тень снизу (эффект нажатия/объема)
    },
    Card: {
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)', // Мягкая тень карточек
      borderRadius: 20,
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={marioTheme}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
