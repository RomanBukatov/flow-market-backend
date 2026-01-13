import { Tabs } from 'antd';
import { ShopOutlined, AppstoreAddOutlined, OrderedListOutlined, ImportOutlined } from '@ant-design/icons';
import { ShopTab } from './seller/ShopTab';
import { SellerProductsTab } from './seller/SellerProductsTab'; 
import { SellerOrdersTab } from './seller/SellerOrdersTab';     
import { ImportTab } from './seller/ImportTab';     

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
  ];

  return <Tabs defaultActiveKey="shop" items={items} type="card" />;
};