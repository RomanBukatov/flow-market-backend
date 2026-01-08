import { Tabs } from 'antd';
import { ShopOutlined, AppstoreAddOutlined, OrderedListOutlined } from '@ant-design/icons';
import { ShopTab } from './seller/ShopTab';

export const SellerDashboard = () => {
  const items = [
    {
      key: 'shop',
      label: 'Мой магазин',
      icon: <ShopOutlined />,
      children: <ShopTab />,
    },
    {
      key: 'products',
      label: 'Товары',
      icon: <AppstoreAddOutlined />,
      children: <div>Тут будет управление товарами</div>,
    },
    {
      key: 'orders',
      label: 'Входящие заказы',
      icon: <OrderedListOutlined />,
      children: <div>Тут будут заказы</div>,
    },
  ];

  return <Tabs defaultActiveKey="shop" items={items} type="card" />;
};