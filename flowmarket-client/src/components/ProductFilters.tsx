import { useState, useEffect } from 'react';
import { Card, Slider, InputNumber, Select, Button, Typography, Switch, Input} from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import type { ProductFilter } from '../types/catalog';

const { Title } = Typography;
const { Search } = Input;

interface ProductFiltersProps {
  filters: ProductFilter;
  onChange: (newFilters: ProductFilter) => void;
}

export const ProductFilters = ({ filters, onChange }: ProductFiltersProps) => {
  // Локальный стейт, чтобы ползунок бегал плавно, не дёргая API
  const [localPrice, setLocalPrice] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 50000
  ]);

  // Синхронизация, если фильтры сбросили снаружи
  useEffect(() => {
    setLocalPrice([filters.minPrice || 0, filters.maxPrice || 50000]);
  }, [filters]);

  // Срабатывает только когда ОТПУСТИЛИ ползунок
  const onAfterChange = (value: number[]) => {
    onChange({ ...filters, minPrice: value[0], maxPrice: value[1] });
  };

  return (
    <Card className="static-card" style={{ height: 'fit-content' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <FilterOutlined style={{ marginRight: 8, fontSize: 18, color: '#ff6b6b' }} />
        <Title level={4} style={{ margin: 0 }}>Фильтры</Title>
      </div>

      {/* ПОИСК */}
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Найти букет..."
          allowClear
          enterButton
          size="large"
          onSearch={(value) => onChange({ ...filters, search: value })}
          style={{ width: '100%' }}
        />
      </div>

      {/* ЦЕНА */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Цена (₽)</div>
        <Slider
          range
          min={0}
          max={50000}
          value={localPrice} // Привязываем к локальному
          onChange={(value) => setLocalPrice(value as [number, number])} // Меняем только локально (визуал)
          onAfterChange={onAfterChange} // <--- ОТПРАВЛЯЕМ ЗАПРОС ТОЛЬКО ТУТ
          trackStyle={[{ backgroundColor: '#ff6b6b' }]}
          handleStyle={[{ borderColor: '#ff6b6b' }, { borderColor: '#ff6b6b' }]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <InputNumber
            min={0}
            controls={false}
            value={filters.minPrice}
            onChange={(v) => onChange({ ...filters, minPrice: v || 0 })}
            placeholder="От"
          />
          <InputNumber
            min={0}
            controls={false}
            value={filters.maxPrice}
            onChange={(v) => onChange({ ...filters, maxPrice: v || 50000 })}
            placeholder="До"
          />
        </div>
      </div>

      {/* ЦВЕТ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Цвет</div>
        <Select
          style={{ width: '100%' }}
          placeholder="Выберите цвет"
          allowClear
          value={filters.color}
          onChange={(v) => onChange({ ...filters, color: v })}
          options={[
            { value: 'Красный', label: '🔴 Красный' },
            { value: 'Белый', label: '⚪ Белый' },
            { value: 'Розовый', label: '🌸 Розовый' },
            { value: 'Желтый', label: '🟡 Желтый' },
            { value: 'Оранжевый', label: '🟠 Оранжевый' },
            { value: 'Фиолетовый', label: '💜 Фиолетовый' },
            { value: 'Синий', label: '🔵 Синий' },
            { value: 'Персиковый', label: '🍑 Персиковый' },
            { value: 'Зеленый', label: '🟢 Зеленый' },
            { value: 'Микс', label: '🎨 Микс' },
          ]}
        />
      </div>

      {/* ПОВОД */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Повод</div>
        <Select
          style={{ width: '100%' }}
          placeholder="Любой повод"
          allowClear
          value={filters.occasion}
          onChange={(v) => onChange({ ...filters, occasion: v })}
          options={[
            { value: 'Без повода', label: '😐 Без повода' },
            { value: 'День рождения', label: '🎂 День рождения' },
            { value: 'Свидание', label: '❤️ Свидание' },
            { value: 'Свадьба', label: '💍 Свадьба' },
            { value: 'Маме', label: '👩‍👧 Маме' },
            { value: 'Юбилей', label: '🎉 Юбилей' },
            { value: 'Коллеге', label: '💼 Коллеге' },
            { value: 'Извинение', label: '🙏 Извинение' },
          ]}
        />
      </div>

      {/* ФИЛЬТР: СОБРАН СЕГОДНЯ */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Только собранные сегодня</span>
        <Switch
          checked={filters.isDailyOffer}
          onChange={(checked) => onChange({ ...filters, isDailyOffer: checked || undefined })}
        />
      </div>

      {/* ГАБАРИТЫ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Высота (см)</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <InputNumber
             placeholder="От" style={{ width: '100%' }} min={0} controls={false}
             value={filters.minHeight}
             onChange={(v) => onChange({ ...filters, minHeight: v || undefined })}
          />
          <InputNumber
             placeholder="До" style={{ width: '100%' }} min={0} controls={false}
             value={filters.maxHeight}
             onChange={(v) => onChange({ ...filters, maxHeight: v || undefined })}
          />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Ширина (см)</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <InputNumber
             placeholder="От" style={{ width: '100%' }} min={0} controls={false}
             value={filters.minWidth}
             onChange={(v) => onChange({ ...filters, minWidth: v || undefined })}
          />
          <InputNumber
             placeholder="До" style={{ width: '100%' }} min={0} controls={false}
             value={filters.maxWidth}
             onChange={(v) => onChange({ ...filters, maxWidth: v || undefined })}
          />
        </div>
      </div>

      {/* СБРОСИТЬ */}
      <Button block onClick={() => onChange({})}>
        Сбросить все
      </Button>
    </Card>
  );
};