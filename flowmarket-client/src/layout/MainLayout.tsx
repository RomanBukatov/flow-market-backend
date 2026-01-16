import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Dropdown, Button, Space, Avatar, FloatButton } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  ShopOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useCartStore } from '../store/cartStore';
import { CartDrawer } from '../components/CartDrawer';
import { useState } from 'react';
import { useCityStore, AVAILABLE_CITIES } from '../store/cityStore';

const { Header, Content, Footer } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { currentCity, setCity } = useCityStore();

  // Читаем роль из памяти
  const userRole = localStorage.getItem('userRole');
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  // Меню городов
  const cityMenu = {
    items: AVAILABLE_CITIES.map(city => ({
      key: city,
      label: city,
      onClick: () => setCity(city),
    }))
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mario-cart-storage');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Базовые пункты
  const menuItems: any[] = [
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile?tab=settings'),
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'Мои покупки',
      onClick: () => navigate('/profile?tab=orders'),
    },
  ];

  // ЛОГИКА ДЛЯ СЕЛЛЕРА
  if (userRole === '1' || userRole === 'Seller') {
    menuItems.splice(2, 0, {
      type: 'divider' as const,
    });
    
    menuItems.splice(3, 0, {
      key: 'seller-dashboard',
      icon: <ShopOutlined style={{ color: '#ff4d4f' }} />,
      label: <span style={{ fontWeight: 500 }}>Кабинет Продавца</span>,
      onClick: () => navigate('/profile?tab=shop'),
    });
  }

  // Добавляем Выход в конец
  menuItems.push(
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout,
    }
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', // Базовый паддинг (на мобилке перезапишется CSS)
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: 64
      }}>
        {/* 1. Логотип с классом */}
        <div
            className="header-logo" // <--- КЛАСС ИЗ CSS
            onClick={() => navigate('/catalog')}
        >
            MarioFlowers 🍄
        </div>

        {/* 2. Город (можно скрыть на очень мелких экранах, если надо, но пока оставим) */}
        <Dropdown menu={cityMenu} trigger={['click']}>
          <Button type="text" icon={<EnvironmentOutlined style={{ color: '#ff6b6b' }} />} style={{ fontSize: '13px' }}>
             <span className="hidden-xs">{currentCity}</span> {/* Можно скрывать текст города на xs */}
             <DownOutlined style={{ fontSize: 10, marginLeft: 5 }} />
          </Button>
        </Dropdown>

        {/* 3. Профиль */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ff6b6b' }} size="small" />
              {/* Класс чтобы скрыть слово "Аккаунт" на мобиле */}
              <span className="header-account-text" style={{ fontWeight: 500, color: '#333' }}>Аккаунт</span>
              <DownOutlined style={{ fontSize: 10, color: '#999' }} />
            </Space>
          </Button>
        </Dropdown>
      </Header>

      <Content style={{
        marginTop: 64, // <--- Отступ равен высоте шапки, чтобы не перекрывало
        minHeight: 'calc(100vh - 64px - 70px)' // Вычет шапки и футера
      }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999', background: '#f1f3f5' }}>
        Mario Flowers ©2026
      </Footer>

      <FloatButton
        icon={<ShoppingCartOutlined />}
        type="primary"
        style={{ width: 60, height: 60, right: 24, bottom: 24 }}
        badge={{ count: cartItemsCount, color: 'blue' }}
        onClick={() => setCartOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* НИЖНЕЕ МЕНЮ (MOBILE ONLY) */}
      <div className="bottom-nav">
        <button
          className={`nav-item ${location.pathname === '/catalog' ? 'active' : ''}`}
          onClick={() => navigate('/catalog')}
        >
          <HomeOutlined className="nav-icon" />
          <span>Витрина</span>
        </button>

        <button
          className={`nav-item ${location.pathname.includes('profile') && !location.search.includes('orders') ? 'active' : ''}`}
          onClick={() => navigate('/profile?tab=settings')}
        >
          <UserOutlined className="nav-icon" />
          <span>Профиль</span>
        </button>

        <button
          className={`nav-item ${location.search.includes('orders') ? 'active' : ''}`}
          onClick={() => navigate('/profile?tab=orders')}
        >
          <ShoppingOutlined className="nav-icon" />
          <span>Заказы</span>
        </button>
      </div>
    </Layout>
  );
};