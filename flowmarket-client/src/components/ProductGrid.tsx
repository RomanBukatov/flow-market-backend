import React from 'react';
import { Card, Button, Row, Col, Tag, Badge, message, Empty, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/catalog';
import { useCartStore } from '../store/cartStore';
import styles from './ProductCard.module.css';
import { CountdownTimer } from './CountdownTimer';

const { Title, Text } = Typography;

interface ProductGridProps {
  products: Product[] | undefined;
  viewMode: 'grid' | 'list';
}


export const ProductGrid = React.memo(({ products, viewMode }: ProductGridProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return (
      <div style={{ padding: '50px 0', textAlign: 'center' }}>
        <Empty
          image="/empty-cart.png"
          imageStyle={{ height: 200 }}
          description={
            <div style={{ marginTop: 20 }}>
              <Title level={4} style={{ color: '#999' }}>По вашему запросу ничего не найдено</Title>
              <Text type="secondary">
                Попробуйте изменить фильтры, выбрать другой город или загляните позже! ☁️
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  // Если режим СПИСОК
  if (viewMode === 'list') {
    return (
      <Row gutter={[16, 16]}>
        {products?.map((product) => (
          <Col span={24} key={product.id}>
            <Badge.Ribbon
              text="Собран сегодня"
              color="green"
              style={{ display: product.isDailyOffer ? 'block' : 'none' }}
            >
              <div onClick={() => navigate('/product/' + product.id)} style={{ cursor: 'pointer' }}>
                <Card hoverable bodyStyle={{ padding: 12 }}>
                <Row gutter={16} align="middle">
                  <Col flex="100px">
                    <img
                      src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : "https://placehold.co/600x400"}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </Col>
                  <Col flex="auto">
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>{product.name}</div>
                    <div style={{ color: '#888' }}>{product.shopName}</div>
                    {product.isDailyOffer && (
                      <div style={{ marginTop: 8 }}>
                        <CountdownTimer createdAt={product.createdAt} />
                      </div>
                    )}
                    <Tag icon={<ClockCircleOutlined />} color="warning">{product.assemblyTimeMinutes} мин</Tag>
                  </Col>
                  <Col>
                     <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{product.price} ₽</div>
                     <Button type="primary" onClick={(e) => {
                       e.stopPropagation();
                       addToCart(product);
                       message.success('Добавлено');
                     }}>В корзину</Button>
                  </Col>
                </Row>
                </Card>
              </div>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    );
  }

  // Если режим СЕТКА
  return (
    <Row gutter={[12, 12]}>
      {products?.map((product) => (
        <Col
          xs={12}
          sm={8}
          md={6}
          lg={6}
          key={product.id}
        >
          <Badge.Ribbon
            text="Собран сегодня"
            color="green"
            style={{ display: product.isDailyOffer ? 'block' : 'none' }}
          >
            <div onClick={() => navigate('/product/' + product.id)} style={{ cursor: 'pointer' }}>
              <Card
                hoverable
                bodyStyle={{ padding: 12 }}
              cover={
                <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '16px 16px 0 0' }}>
                  <img
                    alt={product.name}
                    src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : "https://placehold.co/600x400"}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              }
            >
              <div style={{ padding: '0 4px' }}>
                {/* ЦЕНА */}
                <div style={{ fontSize: 18, fontWeight: 800, color: '#333', marginBottom: 4 }}>
                  {product.price} ₽
                </div>

                {/* НАЗВАНИЕ (Ровно 2 строки) */}
                <div style={{
                  fontSize: 14,
                  lineHeight: '18px',
                  height: 36,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: 8,
                  color: '#555'
                }}>
                  {product.name}
                </div>

                {/* ТАЙМЕР */}
                {product.isDailyOffer && (
                  <div style={{ marginTop: 8 }}>
                    <CountdownTimer createdAt={product.createdAt} />
                  </div>
                )}

                {/* ВРЕМЯ */}
                <div style={{ fontSize: 12, color: '#999', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined /> {product.assemblyTimeMinutes} мин.
                </div>

                {/* КНОПКА */}
                <Button
                  type="primary"
                  block
                  className={styles.cartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                    message.success('Добавлено');
                  }}
                >
                  В корзину
                </Button>
              </div>
              </Card>
            </div>
          </Badge.Ribbon>
        </Col>
      ))}
    </Row>
  );
});
