import { Card, Col, Row, Statistic } from 'antd';
import { DollarCircleOutlined, ShoppingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../../../../api/shop';

export const SellerStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['shop-stats'],
    queryFn: shopApi.getStats,
  });

  if (!stats) return null;

  // Общий стиль для всех карточек, чтобы они были одинаковыми
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center'
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch"> {/* align="stretch" выравнивает колонки */}
      <Col xs={24} sm={8}>
        <Card bordered={false} className="static-card" style={cardStyle}>
          <Statistic
            title="Выручка"
            value={stats.totalRevenue}
            precision={0}
            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            prefix={<DollarCircleOutlined />}
            suffix="₽"
          />
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card bordered={false} className="static-card" style={cardStyle}>
          <Statistic
            title="Заказов"
            value={stats.totalOrders}
            prefix={<ShoppingOutlined />}
          />
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {stats.completedOrders} выполнено
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card bordered={false} className="static-card" style={cardStyle}>
          <Statistic
            title="Средний чек"
            value={stats.averageCheck}
            precision={0}
            prefix={<CheckCircleOutlined />}
            suffix="₽"
          />
        </Card>
      </Col>
    </Row>
  );
};