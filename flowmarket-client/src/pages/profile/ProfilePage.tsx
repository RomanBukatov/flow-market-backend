import { Typography, Spin, Tabs, Statistic, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { userApi } from '../../api/user';
import { OrdersTab } from './tabs/OrdersTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SellerDashboard } from './tabs/SellerDashboard';
import { ShoppingOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const ProfilePage = () => {
  // Хук для работы с параметрами URL (?tab=...)
  const [searchParams, setSearchParams] = useSearchParams();

  // Определяем активную вкладку. Если в URL пусто -> открываем 'orders'
  const activeTab = searchParams.get('tab') || 'orders';

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

  // Ключи (key) теперь должны совпадать с названиями в URL
  const items = [
    {
      key: 'orders', // <--- БЫЛО '1', СТАЛО 'orders'
      label: 'Заказы',
      icon: <ShoppingOutlined />,
      children: <OrdersTab />,
    },
    {
      key: 'settings', // <--- БЫЛО '2', СТАЛО 'settings'
      label: 'Профиль',
      icon: <UserOutlined />,
      children: <SettingsTab profile={profile} />,
    },
  ];

  // Для селлера
  if (profile?.role === 'Seller' || profile?.role === '1') {
      items.push({
          key: 'shop', // <--- key='shop'
          label: 'Кабинет Продавца',
          icon: <ShopOutlined />,
          children: <SellerDashboard />
      });
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>Личный кабинет</Title>

      {/* Карточка бонусов всегда сверху - это важно для лояльности */}
      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)', border: 'none' }}>
         <Statistic
           title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Ваши бонусы</span>}
           value={profile?.bonusBalance}
           suffix="Б"
           valueStyle={{ color: 'white', fontWeight: 'bold' }}
         />
      </Card>

      <Tabs
        activeKey={activeTab} // <-- Привязываем к URL
        items={items}
        size="large"
        // Когда кликаем на таб, меняем URL
        onChange={(key) => setSearchParams({ tab: key })}
      />
    </div>
  );
};