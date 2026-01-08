import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Button, Space, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  ShoppingOutlined, 
  ShopOutlined, 
  DownOutlined 
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Читаем роль из памяти
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mario-cart-storage');
    localStorage.removeItem('userRole'); // Не забываем чистить роль
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
        position: 'sticky', top: 0, zIndex: 100, width: '100%', 
        display: 'flex', alignItems: 'center', padding: '0 20px',
        background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div 
            style={{ fontSize: 20, fontWeight: 800, color: '#ff6b6b', marginRight: 'auto', cursor: 'pointer' }}
            onClick={() => navigate('/catalog')}
        >
            MarioFlowers 🍄
        </div>
        
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

      <Content style={{ marginTop: 0 }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999' }}>
        Mario Flowers ©2026
      </Footer>
    </Layout>
  );
};