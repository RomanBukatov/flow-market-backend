import { useState } from 'react';
import { Typography, Pagination, Segmented, Row, Col, Drawer, Button } from 'antd';
import { AppstoreOutlined, BarsOutlined, FilterOutlined } from '@ant-design/icons';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog';
import { ProductGrid } from '../../components/ProductGrid';
import { ProductFilters } from '../../components/ProductFilters';
import type { ProductFilter } from '../../types/catalog';
import { useCityStore } from '../../store/cityStore';

const { Title } = Typography;
const PAGE_SIZE = 48;

export const CatalogPage = () => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Стейт фильтров
  const [filters, setFilters] = useState<ProductFilter>({});
  const currentCity = useCityStore((state) => state.currentCity);

  const { data: pagedResponse, isFetching } = useQuery({
    queryKey: ['products', page, filters, currentCity], 
    queryFn: () => catalogApi.getProducts(page, PAGE_SIZE, {
      ...filters,
      city: currentCity === 'Все города' ? undefined : currentCity
    }),
    placeholderData: keepPreviousData,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <>
      <div style={{ padding: '10px', maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>Витрина</Title>

          <Segmented
            options={[
              { value: 'grid', icon: <AppstoreOutlined /> },
              { value: 'list', icon: <BarsOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </div>

        {/* КНОПКА ФИЛЬТРОВ (Только мобилка) */}
        <Button
          className="mobile-filters-btn"
          icon={<FilterOutlined />}
          block
          size="large"
          onClick={() => setMobileFiltersOpen(true)}
        >
          Фильтры и сортировка
        </Button>

        {/* ШТОРКА ФИЛЬТРОВ (Только мобилка) */}
        <Drawer
          title="Фильтры"
          placement="left"
          onClose={() => setMobileFiltersOpen(false)}
          open={mobileFiltersOpen}
          width="85%" // Почти на весь экран
        >
          <ProductFilters filters={filters} onChange={setFilters} />
        </Drawer>

        <Row gutter={24}>
            {/* ЛЕВАЯ КОЛОНКА (ФИЛЬТРЫ) - Скрываем на мобилках (xs=0) */}
            <Col xs={0} lg={6} xl={5}>
               <ProductFilters filters={filters} onChange={setFilters} />
            </Col>

            {/* ПРАВАЯ КОЛОНКА (ТОВАРЫ) */}
            <Col xs={24} lg={18} xl={19}>
               <div style={{ opacity: isFetching ? 0.5 : 1, transition: '0.2s' }}>
                  {/* Пробрасываем товары */}
                   <ProductGrid products={pagedResponse?.items} viewMode={viewMode} />
               </div>
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
            </Col>
         </Row>
       </div>
    </>
  );
};
