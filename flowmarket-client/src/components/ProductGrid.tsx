import React from 'react';
import { Card, Button, Row, Col, Tag, Badge, message } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Product } from '../types/catalog';
import { useCartStore } from '../store/cartStore';

const { Meta } = Card;

interface ProductGridProps {
  products: Product[] | undefined;
}

// Выносим компонент, чтобы он не зависел от стейта родителя
export const ProductGrid = React.memo(({ products }: ProductGridProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <Row gutter={[16, 16]}>
      {products?.map((product) => (
        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
          <Badge.Ribbon 
            text="Собран сегодня" 
            color="green" 
            style={{ display: product.isDailyOffer ? 'block' : 'none' }}
          >
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '16px 16px 0 0' }}>
                  <img 
                    alt={product.name} 
                    src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : "https://placehold.co/600x400"} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    loading="lazy" // Ленивая загрузка картинок (ускоряет)
                  />
                </div>
              }
              actions={[
                <div key="price" style={{ fontWeight: 'bold', fontSize: 16 }}>{product.price} ₽</div>,
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />}
                  onClick={() => {
                    addToCart(product);
                    message.success('Добавлено'); 
                  }}
                >
                  В корзину
                </Button>
              ]}
            >
              <Meta
                title={product.name}
                description={
                  <div>
                    <div style={{ marginBottom: 5, color: '#888' }}>🏪 {product.shopName}</div>
                    <Tag icon={<ClockCircleOutlined />} color="warning">
                      {product.assemblyTimeMinutes} мин
                    </Tag>
                  </div>
                }
              />
            </Card>
          </Badge.Ribbon>
        </Col>
      ))}
    </Row>
  );
});
