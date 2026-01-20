import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd' // Провайдер темы
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // React Query
import { HelmetProvider } from 'react-helmet-async' // <--- Импорт
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
    colorPrimary: '#ff6b6b', // Мягкий кораллово-красный (вместо ядерного #ff4d4f)
    colorTextHeading: '#495057', // Темно-серый текст (не черный)
    borderRadius: 20,
    fontFamily: 'Varela Round, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: '#ff6b6b',
      algorithm: true,
      fontWeight: 700,
      // Тень делаем темнее основного цвета
      boxShadow: '0 6px 0 #e03e3e', 
    },
    Card: {
      borderRadius: 24,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 45, // Повыше
      colorBgContainer: '#f8f9fa', // Чуть серый фон инпутов
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider> {/* <--- ОБЕРТКА */}
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={marioTheme}>
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
