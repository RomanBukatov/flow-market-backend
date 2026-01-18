import { Tabs } from 'antd';
import { ShopOutlined, AppstoreAddOutlined, OrderedListOutlined, ImportOutlined, CarOutlined } from '@ant-design/icons';
import { ShopTab } from './seller/ShopTab';
import { SellerProductsTab } from './seller/SellerProductsTab';
import { SellerOrdersTab } from './seller/SellerOrdersTab';
import { ImportTab } from './seller/ImportTab';
import { SellerStats } from './seller/SellerStats';
import { SellerDeliveryTab } from './seller/SellerDeliveryTab';

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
      children: <SellerProductsTab />, 
    },
    {
      key: 'orders',
      label: 'Входящие заказы',
      icon: <OrderedListOutlined />,
      children: <SellerOrdersTab />,  
    },
    {
      key: 'import',
      label: 'Импорт',
      icon: <ImportOutlined />,
      children: <ImportTab />,
    },
    {
      key: 'delivery',
      label: 'Доставка',
      icon: <CarOutlined />,
      children: <SellerDeliveryTab />,
    },
  ];

  return (
    <>
      <SellerStats />
      <Tabs defaultActiveKey="shop" items={items} type="card" />
    </>
  );
};