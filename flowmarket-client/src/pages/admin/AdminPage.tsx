import { useState } from 'react';
import { Tabs, Table, Tag, Typography, Button, Grid, List, Card, Input, Popconfirm, Avatar, message } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { translateStatus, getStatusColor } from '../../utils/formatters';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const AdminPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // Мобилка, если меньше планшета

  // --- ЗАПРОСЫ ---
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getOrders,
  });

  // Товары (с пагинацией и поиском)
  const [prodPage, setProdPage] = useState(1);
  const [prodSearch, setProdSearch] = useState('');
  
  const { data: adminProducts, refetch: refetchProds, isLoading: prodsLoading } = useQuery({
      queryKey: ['admin-products', prodPage, prodSearch],
      queryFn: () => adminApi.getProducts(prodPage, prodSearch),
  });

  const deleteProdMutation = useMutation({
      mutationFn: adminApi.deleteProduct,
      onSuccess: () => {
          message.success('Товар заблокирован');
          refetchProds();
      }
  });

  // --- ХЕЛПЕРЫ ---
  const translateRole = (role: string) => {
    switch(role) {
        case 'Admin': return 'Админ';
        case 'Seller': return 'Продавец';
        case 'Buyer': return 'Покупатель';
        default: return role;
    }
  };

  // --- КОЛОНКИ (ДЛЯ ПК) ---
  const userColumns = [
    { title: 'Имя', dataIndex: 'fullName', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Телефон', dataIndex: 'phoneNumber', key: 'phone' },
    { title: 'Роль', dataIndex: 'role', key: 'role', 
      render: (r: string) => <Tag color={r === 'Seller' ? 'purple' : r === 'Admin' ? 'gold' : 'blue'}>{translateRole(r)}</Tag> 
    },
    { title: 'Регистрация', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  const orderColumns = [
    { title: 'Дата', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleString() },
    { title: 'Клиент', dataIndex: 'customer' },
    { title: 'Сумма', dataIndex: 'total', render: (v: number) => <b>{v} ₽</b> },
    { title: 'Статус', dataIndex: 'status', 
      render: (s: string) => <Tag color={getStatusColor(s)}>{translateStatus(s)}</Tag> 
    },
  ];

  const productColumns = [
    { title: 'Фото', dataIndex: 'imageUrl', render: (u: string) => <Avatar src={u} shape="square" size={50} /> },
    { title: 'Название', dataIndex: 'name' },
    { title: 'Магазин', dataIndex: 'shopName', render: (n: string) => <Tag color="purple">{n}</Tag> },
    { title: 'Цена', dataIndex: 'basePrice', render: (p: number) => <b>{p} ₽</b> },
    { 
        title: 'Бан', 
        key: 'action', 
        render: (_: any, r: any) => (
            <Popconfirm title="Заблокировать товар?" onConfirm={() => deleteProdMutation.mutate(r.id)}>
                <Button danger size="small" icon={<DeleteOutlined />}>Удалить</Button>
            </Popconfirm>
        )
    }
  ];

  // --- КОНТЕНТ ТАБОВ ---

  const UsersTab = () => isMobile ? (
    <List
      dataSource={users}
      loading={usersLoading}
      renderItem={(user: any) => (
        <Card size="small" className="static-card" style={{ marginBottom: 10 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
               <b>{user.fullName}</b>
               <Tag color={user.role === 'Seller' ? 'purple' : 'blue'}>{translateRole(user.role)}</Tag>
           </div>
           <div style={{ color: '#666', fontSize: 13 }}>
             <div>📧 {user.email}</div>
             <div>📞 {user.phoneNumber || '-'}</div>
           </div>
        </Card>
      )}
    />
  ) : (
    <Table dataSource={users} columns={userColumns} rowKey="id" loading={usersLoading} />
  );

  const OrdersTab = () => isMobile ? (
    <List
      dataSource={orders}
      loading={ordersLoading}
      renderItem={(order: any) => (
        <Card size="small" className="static-card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>{new Date(order.date).toLocaleDateString()}</Text>
                <Tag color={getStatusColor(order.status)}>{translateStatus(order.status)}</Tag>
            </div>
            <div style={{ margin: '10px 0' }}>
                <div>👤 {order.customer}</div>
                <div>📱 {order.phone}</div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{order.total} ₽</div>
        </Card>
      )}
    />
  ) : (
    <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={ordersLoading} />
  );

  const ProductsTab = () => (
    <>
        <Input.Search 
            placeholder="Поиск товара или магазина..." 
            onSearch={setProdSearch} 
            allowClear
            enterButton
            style={{ marginBottom: 20 }} 
        />
        {isMobile ? (
            <List
                dataSource={adminProducts?.items}
                loading={prodsLoading}
                renderItem={(p: any) => (
                    <Card size="small" className="static-card" style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                             <Avatar src={p.imageUrl} shape="square" size={60} />
                             <div style={{ flex: 1 }}>
                                 <div style={{ fontWeight: 'bold', lineHeight: 1.2 }}>{p.name}</div>
                                 <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                                     <ShopOutlined /> {p.shopName}
                                 </div>
                             </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{p.basePrice} ₽</div>
                            <Popconfirm title="Заблокировать?" onConfirm={() => deleteProdMutation.mutate(p.id)}>
                                <Button danger size="small" icon={<DeleteOutlined />}>Бан</Button>
                            </Popconfirm>
                        </div>
                    </Card>
                )}
            />
        ) : (
            <Table 
                dataSource={adminProducts?.items} 
                columns={productColumns} 
                rowKey="id" 
                loading={prodsLoading}
                pagination={{
                    current: prodPage,
                    total: adminProducts?.totalCount,
                    pageSize: 10,
                    onChange: setProdPage
                }}
            />
        )}
    </>
  );

  return (
    <div style={{ padding: '20px 10px', maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>👑 Панель Владельца</Title>
        <Button onClick={() => navigate('/catalog')}>В магазин</Button>
      </div>
      
      <Tabs 
        defaultActiveKey="1" 
        items={[
            { key: '1', label: 'Юзеры', children: <UsersTab /> },
            { key: '2', label: 'Заказы', children: <OrdersTab /> },
            { key: '3', label: 'Товары', children: <ProductsTab /> }
        ]} 
      />
    </div>
  );
};