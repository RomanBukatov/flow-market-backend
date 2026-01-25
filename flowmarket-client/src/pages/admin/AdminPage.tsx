import { Tabs, Table, Tag, Typography, Button, Grid, List, Card} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const AdminPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // Если меньше планшета - мобилка

  // Запросы
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getOrders,
  });

  // --- КОЛОНКИ ДЛЯ ПК ---
  const userColumns = [
    { title: 'Имя', dataIndex: 'fullName', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Телефон', dataIndex: 'phoneNumber', key: 'phone' },
    { title: 'Роль', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={r === 'Seller' ? 'purple' : 'blue'}>{r}</Tag> },
    { title: 'Дата регистрации', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  const orderColumns = [
    { title: 'Дата', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleString() },
    { title: 'Клиент', dataIndex: 'customer' },
    { title: 'Телефон', dataIndex: 'phone' },
    { title: 'Сумма', dataIndex: 'total', render: (v: number) => <b>{v} ₽</b> },
    { title: 'Статус', dataIndex: 'status', render: (s: string) => <Tag color={s === 'Completed' ? 'green' : 'blue'}>{s}</Tag> },
  ];

  // --- РЕНДЕР ТАБОВ ---
  const items = [
    {
        key: '1',
        label: `Пользователи (${users?.length || 0})`,
        children: isMobile ? (
            // МОБИЛЬНЫЙ СПИСОК ЮЗЕРОВ
            <List
                dataSource={users}
                loading={usersLoading}
                renderItem={(user: any) => (
                    <Card size="small" className="static-card" style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{user.fullName}</div>
                                <div style={{ color: '#888', fontSize: 13 }}>{user.email}</div>
                            </div>
                            <Tag color={user.role === 'Seller' ? 'purple' : 'blue'}>{user.role}</Tag>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13 }}>
                            <div>📞 {user.phoneNumber || 'Нет телефона'}</div>
                            <div style={{ color: '#aaa', marginTop: 4 }}>Рег: {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                    </Card>
                )}
            />
        ) : (
            <Table dataSource={users} columns={userColumns} rowKey="id" loading={usersLoading} pagination={{ pageSize: 10 }} />
        )
    },
    {
        key: '2',
        label: `Заказы (${orders?.length || 0})`,
        children: isMobile ? (
            // МОБИЛЬНЫЙ СПИСОК ЗАКАЗОВ
            <List
                dataSource={orders}
                loading={ordersLoading}
                renderItem={(order: any) => (
                    <Card size="small" className="static-card" style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text strong>#{order.id.substring(0, 8)}</Text>
                            <Text type="secondary">{new Date(order.date).toLocaleDateString()}</Text>
                        </div>
                        
                        <div style={{ marginBottom: 8 }}>
                            <div>👤 {order.customer}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>📞 {order.phone}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                            <Tag color={order.status === 'Completed' ? 'green' : 'blue'}>{order.status}</Tag>
                            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{order.total} ₽</span>
                        </div>
                    </Card>
                )}
            />
        ) : (
            <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={ordersLoading} pagination={{ pageSize: 10 }} />
        )
    }
  ];

  return (
    <div style={{ padding: '20px 10px', maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>👑 Панель Владельца</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/catalog')}>В магазин</Button>
      </div>
      
      <Tabs defaultActiveKey="1" items={items} type="card" />
    </div>
  );
};