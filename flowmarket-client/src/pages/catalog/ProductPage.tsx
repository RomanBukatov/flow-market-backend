import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Spin, Typography, Tag, Row, Col, Divider, message, Image } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, ShopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { catalogApi } from '../../api/catalog';
import { useCartStore } from '../../store/cartStore';

const { Title, Paragraph } = Typography;

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProductById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto', paddingBottom: 100 }}>
      {/* Кнопка Назад */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        type="text" 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: 10 }}
      >
        Назад
      </Button>

      <Row gutter={[32, 32]}>
        {/* ЛЕВАЯ КОЛОНКА: ФОТО */}
        <Col xs={24} md={12}>
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <Image 
              src={product.imageUrl || "https://placehold.co/600x600"} 
              width="100%" 
              height={400} 
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Col>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
          
          <div style={{ marginTop: 10, marginBottom: 20 }}>
            <Tag icon={<ShopOutlined />} color="blue">{product.shopName}</Tag>
            <Tag icon={<ClockCircleOutlined />} color="warning">{product.assemblyTimeMinutes} мин</Tag>
            {product.isDailyOffer && <Tag color="green">Собран сегодня</Tag>}
          </div>

          <Title level={1} style={{ color: '#ff4d4f', margin: 0 }}>{product.price} ₽</Title>

          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingCartOutlined />} 
            block 
            style={{ marginTop: 20, height: 50, fontSize: 18 }}
            onClick={() => {
              addToCart(product);
              message.success('Добавлено в корзину');
            }}
          >
            В корзину
          </Button>

          <Divider />

          <Title level={4}>Описание</Title>
          <Paragraph type="secondary">
            {product.description || "Описание отсутствует."}
          </Paragraph>

          {/* Состав (если есть) - потом распарсим JSON, пока просто текст */}
          {product.composition && product.composition !== "{}" && (
             <>
                <Title level={4} style={{ marginTop: 20 }}>Состав</Title>
                <Paragraph>{product.composition}</Paragraph>
             </>
          )}
        </Col>
      </Row>
    </div>
  );
};