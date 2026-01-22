import { Tabs, Table, Tag, Typography, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const AdminPage = () => {
  const navigate = useNavigate();

  // Запросы
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getOrders,
  });

  // Колонки Юзеров
  const userColumns = [
    { title: 'Имя', dataIndex: 'fullName', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Телефон', dataIndex: 'phoneNumber', key: 'phone' },
    { title: 'Роль', dataIndex: 'role', key: 'role', render: (r: string) => <Tag>{r}</Tag> },
    { title: 'Дата регистрации', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  // Колонки Заказов
  const orderColumns = [
    { title: 'Дата', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleString() },
    { title: 'Клиент', dataIndex: 'customer' },
    { title: 'Телефон', dataIndex: 'phone' },
    { title: 'Сумма', dataIndex: 'total', render: (v: number) => <b>{v} ₽</b> },
    { title: 'Статус', dataIndex: 'status', render: (s: string) => <Tag color={s === 'Completed' ? 'green' : 'blue'}>{s}</Tag> },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title level={2}>Панель Владельца</Title>
        <Button onClick={() => navigate('/catalog')}>В магазин</Button>
      </div>
      
      <Tabs defaultActiveKey="1" items={[
        {
            key: '1',
            label: `Пользователи (${users?.length || 0})`,
            children: <Table dataSource={users} columns={userColumns} rowKey="id" loading={usersLoading} />
        },
        {
            key: '2',
            label: `Все Заказы (${orders?.length || 0})`,
            children: <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={ordersLoading} />
        }
      ]} />
    </div>
  );
};