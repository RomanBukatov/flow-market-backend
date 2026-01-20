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
import { useState, useEffect } from 'react';
import { useCityStore, AVAILABLE_CITIES } from '../store/cityStore';

const { Header, Content, Footer } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(true); // Сначала true, чтобы не мелькало
  const { currentCity, setCity } = useCityStore();

  // Читаем роль из памяти
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  useEffect(() => {
    // Проверяем только на клиенте
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) setCookiesAccepted(false);
  }, []);

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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        // 👇 ЦВЕТ НЕБА МАРИО 👇
        background: '#6ca0dc',
        borderBottom: 'none',
        boxShadow: '0 4px 12px rgba(108, 160, 220, 0.4)', // Голубая тень
        height: 64
      }}>
        {/* 1. Логотип с классом */}
        <div
            className="header-logo"
            onClick={() => navigate('/catalog')}
            style={{ display: 'flex', alignItems: 'center' }}
        >
            {/* Используем прозрачный логотип */}
            <img src="/logo.png" alt="MarioFlowers" style={{ height: 45, objectFit: 'contain' }} />
        </div>

        {/* 2. Город (можно скрыть на очень мелких экранах, если надо, но пока оставим) */}
        <Dropdown menu={cityMenu} trigger={['click']}>
          <Button type="text" style={{ color: 'white', fontSize: '13px' }}> {/* color: white */}
             <EnvironmentOutlined />
             <span className="hidden-xs">{currentCity}</span>
             <DownOutlined style={{ fontSize: 10, marginLeft: 5 }} />
          </Button>
        </Dropdown>

        {/* 3. Профиль */}
        {token ? (
          /* Если залогинен — показываем старое меню */
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" style={{ height: 'auto', padding: '4px 8px', color: 'white' }}>
              <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'white' }} size="small" />
                <span className="header-account-text" style={{ fontWeight: 500 }}>Аккаунт</span>
                <DownOutlined style={{ fontSize: 10, color: 'white' }} />
              </Space>
            </Button>
          </Dropdown>
        ) : (
          /* Если НЕ залогинен — кнопка входа */
          <Button 
            type="primary" 
            shape="round"
            onClick={() => navigate('/login')}
          >
            Войти
          </Button>
        )}
      </Header>

      <Content style={{
        marginTop: 64, // <--- Отступ равен высоте шапки, чтобы не перекрывало
        minHeight: 'calc(100vh - 64px - 70px)' // Вычет шапки и футера
      }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999', background: '#f8f9fa', padding: '40px 20px' }}>
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a href="/docs/oferta" style={{ color: '#666' }}>Публичная оферта</a>
            <a href="/docs/privacy" style={{ color: '#666' }}>Политика конфиденциальности</a>
            <a href="/docs/personal-data" style={{ color: '#666' }}>Обработка персональных данных</a>
          </div>

        </div>

        <div>Mario Flowers ©2026</div>
        <div style={{ fontSize: 12, marginTop: 5 }}>ИП Ибраев Виктор Владимирович, ИНН 667219812071</div>
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

      {!cookiesAccepted && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%',
          background: 'rgba(50, 50, 50, 0.9)', color: 'white',
          padding: '15px 20px', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
          backdropFilter: 'blur(5px)'
        }}>
          <span>🍪 Мы используем cookies для работы сайта.</span>
          <Button type="primary" size="small" onClick={() => {
            localStorage.setItem('cookiesAccepted', 'true');
            setCookiesAccepted(true);
          }}>
            ОК
          </Button>
        </div>
      )}
    </Layout>
  );
};