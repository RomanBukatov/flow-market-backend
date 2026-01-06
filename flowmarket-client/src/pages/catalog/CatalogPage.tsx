import { useState } from 'react';
import { Typography, Spin, FloatButton, Pagination } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog';
import { useCartStore } from '../../store/cartStore';
import { CartDrawer } from '../../components/CartDrawer';
import { ProductGrid } from '../../components/ProductGrid';

const { Title } = Typography;
const PAGE_SIZE = 48;

export const CatalogPage = () => {
  const [page, setPage] = useState(1);
  
  const { data: pagedResponse, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => catalogApi.getProducts(page, PAGE_SIZE),
  });

  // Достаем количество товаров для бейджика на кнопке
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const [cartOpen, setCartOpen] = useState(false);

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>Витрина</Title>
        </div>

        {/* Сетка товаров теперь изолирована и не будет перерисовываться при открытии корзины */}
        <ProductGrid products={pagedResponse?.items} />

        {/* Пагинация */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            total={pagedResponse?.totalCount || 0}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* ПЛАВАЮЩАЯ КНОПКА КОРЗИНЫ (Всегда видна) */}
      <FloatButton 
        icon={<ShoppingCartOutlined />} 
        type="primary" 
        style={{ width: 60, height: 60, right: 24, bottom: 24 }}
        badge={{ count: cartItemsCount, color: 'blue' }} // Показывает кол-во товаров
        onClick={() => setCartOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};
