import { Card, Typography, List, Statistic, Row, Col, Spin, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/user';

const { Title } = Typography;

export const ProfilePage = () => {
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
  });

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: userApi.getHistory,
  });

  if (isProfileLoading || isOrdersLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Личный кабинет</Title>

      {/* Блок Бонусов */}
      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }}>
        <Statistic 
          title={<span style={{ color: 'white' }}>Ваши бонусы</span>}
          value={profile?.bonusBalance} 
          suffix="Б"
          valueStyle={{ color: 'white', fontWeight: 'bold' }} 
        />
      </Card>

      <Title level={4}>История заказов</Title>
      <List
        dataSource={orders}
        renderItem={item => (
          <Card style={{ marginBottom: 10 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <div><strong>Заказ #{item.orderId.substring(0, 8)}...</strong></div>
                <div style={{ color: '#888' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
              </Col>
              <Col style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{item.totalAmount} ₽</div>
                <Tag color={item.statusSummary === 'Выполнен' ? 'green' : 'blue'}>
                  {item.statusSummary}
                </Tag>
              </Col>
            </Row>
          </Card>
        )}
      />
    </div>
  );
};