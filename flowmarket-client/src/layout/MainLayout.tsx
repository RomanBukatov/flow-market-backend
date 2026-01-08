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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mario-cart-storage');
    navigate('/login');
  };

  // Элементы меню (определяем внутри компонента, чтобы работал navigate)
  const menuItems = [
    {
      key: 'settings', // Важно: ключи не так важны, важен onClick
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile?tab=settings'), // <--- ЯВНО УКАЗЫВАЕМ ВКЛАДКУ
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'Мои заказы',
      onClick: () => navigate('/profile?tab=orders'), // <--- ЯВНО УКАЗЫВАЕМ ВКЛАДКУ
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout,
    },
  ];

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