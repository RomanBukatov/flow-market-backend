import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Typography, Tag, Row, Col, Image, Card, Avatar, Space, Result, Carousel } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, ShopOutlined, ClockCircleOutlined, SafetyCertificateOutlined, CarOutlined, HeartOutlined, YoutubeOutlined } from '@ant-design/icons';
import { catalogApi } from '../../api/catalog';
import { useCartStore } from '../../store/cartStore';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';

const { Title } = Typography;

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Кэш 5 минут
    retry: 1
  });

  // 1. ЗАГРУЗКА
  if (isLoading) {
    return (
      <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Убрали tip, чтобы не было warning в консоли */}
        <Spin size="large" /> 
      </div>
    );
  }

  // 2. ОШИБКА
  if (isError || !product) {
    return (
      <div style={{ padding: 50 }}>
        <Result
          status="404"
          title="Упс!"
          subTitle="Товар не найден или был удален."
          extra={<Button type="primary" onClick={() => navigate('/catalog')}>В каталог</Button>}
        />
      </div>
    );
  }

  // Собираем все картинки
  const allImages = [product.imageUrl, ...product.images].filter(Boolean);

  // 3. ТОВАР (УСПЕХ)
  return (
    <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto', paddingBottom: 100 }}>
      
      {/* --- SEO FIX --- */}
      {/* Обрати внимание на обратные кавычки ` ` внутри фигурных скобок { } */}
      <Helmet>
        <title>{`${product.name} — ${product.price} ₽ | MarioFlowers`}</title>
        <meta name="description" content={`Купить ${product.name} с доставкой.`} />
      </Helmet>
      {/* ---------------- */}

      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        Назад
      </Button>

      <Row gutter={[40, 40]}>
        {/* ЛЕВАЯ КОЛОНКА */}
        <Col xs={24} md={14}>
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: 24 }}>
            <Carousel autoplay arrows infinite>
              {allImages.map((img, index) => (
                 <div key={index}>
                    <Image src={img && img.startsWith('http') ? img : "https://placehold.co/600x600"} width="100%" height={400} style={{ objectFit: 'cover' }} />
                 </div>
              ))}
            </Carousel>
          </div>

          {/* Видео (если есть) */}
          {product.videoUrl && (
            <div style={{ marginTop: 20 }}>
               <Button href={product.videoUrl} target="_blank" block icon={<YoutubeOutlined />}>
                  Смотреть видео о товаре
               </Button>
            </div>
          )}

          <Card size="small" className="static-card" style={{ background: '#f9f9f9', border: '1px solid #eee' }}>
             <Row align="middle" gutter={16}>
                <Col>
                    <Avatar size={48} icon={<ShopOutlined />} style={{ backgroundColor: '#ff6b6b' }} />
                </Col>
                <Col flex="auto">
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>{product.shopName}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>Проверенный магазин</div>
                </Col>
                <Col>
                    <Button 
                        type="default" 
                        size="small"
                        onClick={() => navigate(`/shop/${product.shopId}`)}
                    >
                        Перейти
                    </Button>
                </Col>
             </Row>
          </Card>
        </Col>

        {/* ПРАВАЯ КОЛОНКА */}
        <Col xs={24} md={10}>
          <Title level={2} style={{ margin: '0 0 10px 0', lineHeight: 1.2 }}>{product.name}</Title>
          
          <Space style={{ marginBottom: 20 }}>
            <Tag icon={<ClockCircleOutlined />} color="warning">{product.assemblyTimeMinutes} мин</Tag>
            {product.isDailyOffer && <Tag color="green">Собран сегодня</Tag>}
          </Space>

          <Card className="static-card" style={{ marginBottom: 24, border: '2px solid #f0f0f0' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#333', marginBottom: 16 }}>
                {product.price} ₽
            </div>
            
            <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />} 
                block 
                style={{ height: 56, fontSize: 18, marginBottom: 12 }}
                onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                }}
            >
                В корзину
            </Button>
            <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>
                Оплата картой онлайн
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>
                    <div style={{ fontWeight: 600 }}>Гарантия свежести</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Заменим букет, если завянет за 24ч</div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                    <div style={{ fontWeight: 600 }}>Бережная доставка</div>
                    <div style={{ fontSize: 12, color: '#888' }}>В аквабоксе и защитной пленке</div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <HeartOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                <div>
                    <div style={{ fontWeight: 600 }}>Фото перед отправкой</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Пришлем в чат для согласования</div>
                </div>
             </div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 40 }}>
        <Title level={3}>О товаре</Title>
        <Card className="static-card">
            <div 
                style={{ fontSize: 16, lineHeight: 1.6, color: '#444' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || "Описание отсутствует.") }} 
            />
            {product.composition && product.composition !== "{}" && (
                <div style={{ marginTop: 24 }}>
                    <Title level={4}>Состав</Title>
                    <div>{product.composition}</div>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
};