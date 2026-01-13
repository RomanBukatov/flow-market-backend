import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Dropdown, Button, Space, Avatar, FloatButton, Badge } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  ShopOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useCartStore } from '../store/cartStore';
import { CartDrawer } from '../components/CartDrawer';
import { useState } from 'react';
import { useCityStore, AVAILABLE_CITIES } from '../store/cityStore';

const { Header, Content, Footer } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
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
        position: 'fixed', // <--- FIXED вместо sticky
        top: 0,
        left: 0, // <--- Гарантируем привязку к левому краю
        width: '100%',
        zIndex: 1000, // <--- Чтобы была поверх всего
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px', // Чуть меньше отступы по бокам для мобилок
        background: 'rgba(255, 255, 255, 0.95)', // Чуть прозрачности (эффект стекла)
        backdropFilter: 'blur(10px)', // Размытие фона (как в iOS)
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: 64 // Явно задаем высоту
      }}>
        <div
            style={{ fontSize: 20, fontWeight: 800, color: '#ff6b6b', marginRight: 'auto', cursor: 'pointer' }}
            onClick={() => navigate('/catalog')}
        >
            MarioFlowers 🍄
        </div>
         
        {/* 👇 ВЫБОР ГОРОДА (DNS STYLE) 👇 */}
        <Dropdown menu={cityMenu} trigger={['click']}>
          <Button type="text" icon={<EnvironmentOutlined style={{ color: '#ff6b6b' }} />}>
             {currentCity} <DownOutlined style={{ fontSize: 10, marginLeft: 5 }} />
          </Button>
        </Dropdown>
        
        {/* Распорка, чтобы сдвинуть профиль вправо */}
        <div style={{ marginRight: 'auto' }}></div>
        
        {/* Меню профиля */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ff6b6b' }} />
              <span style={{ fontWeight: 500, color: '#333' }}>Аккаунт</span>
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
    </Layout>
  );
};