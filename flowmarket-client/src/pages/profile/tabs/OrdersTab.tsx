import { List, Card, Row, Col, Tag, Spin, Empty, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../../api/user';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { OrderDetailsModal } from '../../../components/OrderDetailsModal';

export const OrdersTab = () => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: userApi.getHistory,
  });

  if (isLoading) return <Spin />;
  if (!orders || orders.length === 0) return (
      <Empty description="Заказов пока нет">
          <Button type="primary" onClick={() => navigate('/catalog')}>В каталог</Button>
      </Empty>
  );

  return (
    <>
      <List
      dataSource={orders}
      renderItem={item => (
        <Card
          className="static-card"
          style={{ marginBottom: 10, cursor: 'pointer' }}
          size="small"
          onClick={() => {
            setSelectedOrderId(item.orderId);
            setIsModalOpen(true);
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{fontWeight: 600}}>Заказ от {new Date(item.createdAt).toLocaleDateString()}</div>
              <div style={{ color: '#888', fontSize: 12 }}>#{item.orderId.substring(0, 8)}</div>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{item.totalAmount} ₽</div>
              <Tag color={item.statusSummary === 'Выполнен' ? 'green' : 'blue'}>
                {item.statusSummary}
              </Tag>
            </Col>
          </Row>
        </Card>
      )}
    />
    <OrderDetailsModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      orderId={selectedOrderId}
    />
    </>
  );
};