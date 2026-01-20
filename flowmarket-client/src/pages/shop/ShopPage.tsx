import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Spin, Avatar, Card, Button } from 'antd';
import { ShopOutlined, EnvironmentOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shop';
import { catalogApi } from '../../api/catalog';
import { ProductGrid } from '../../components/ProductGrid';
import { Helmet } from 'react-helmet-async';

const { Title, Paragraph } = Typography;

export const ShopPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Инфо о магазине
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopApi.getPublicShop(id!),
    enabled: !!id,
  });

  // 2. Товары этого магазина
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', id],
    // Передаем shopId в фильтр
    queryFn: () => catalogApi.getProducts(1, 100, { shopId: id }),
    enabled: !!id,
  });

  if (shopLoading || productsLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (!shop) return <div>Магазин не найден</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
      <Helmet>
        <title>{shop.name} — каталог товаров | MarioFlowers</title>
        <meta name="description" content={`Заказывайте цветы в магазине ${shop.name}. ${shop.description}`} />
      </Helmet>
       <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>Назад</Button>
      
      {/* ШАПКА МАГАЗИНА */}
      <Card className="static-card" style={{ marginTop: 20, marginBottom: 40, textAlign: 'center' }}>
          <Avatar 
            size={100} 
            src={shop.logoUrl} 
            icon={<ShopOutlined />} 
            style={{ marginBottom: 15, backgroundColor: '#ff6b6b' }} 
          />
          <Title level={2} style={{ margin: 0 }}>{shop.name}</Title>
          <div style={{ color: '#888', marginTop: 5 }}>
            <EnvironmentOutlined /> {shop.city}
          </div>
          <Paragraph style={{ maxWidth: 600, margin: '15px auto', color: '#555' }}>
            {shop.description}
          </Paragraph>
      </Card>

      <Title level={3}>Товары продавца</Title>
      <ProductGrid products={productsData?.items} viewMode="grid" />
    </div>
  );
};