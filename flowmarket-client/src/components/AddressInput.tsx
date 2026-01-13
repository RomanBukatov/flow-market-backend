import { useState } from 'react';
import { AutoComplete, Spin } from 'antd'; // <--- AutoComplete вместо Select
import { dadataApi } from '../api/dadata';
import type { DadataAddress } from '../api/dadata';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

interface AddressInputProps {
  onSelect: (address: string, lat: number, lon: number) => void;
}

export const AddressInput = ({ onSelect }: AddressInputProps) => {
  const [searchValue, setSearchValue] = useState('');

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['address', searchValue],
    queryFn: () => dadataApi.suggestAddress(searchValue),
    enabled: searchValue.length > 2,
  });

  const handleSelect = (value: string, option: any) => {
    // В AutoComplete option.item прокидывается так же
    const item: DadataAddress = option.item;
    if (item?.data?.geo_lat && item?.data?.geo_lon) {
      onSelect(item.value, parseFloat(item.data.geo_lat), parseFloat(item.data.geo_lon));
    }
  };

  // Преобразуем данные для AutoComplete
  const options = suggestions?.map((s) => ({
    value: s.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <EnvironmentOutlined style={{ color: '#ccc' }} />
        <span>{s.value}</span>
      </div>
    ),
    item: s, // Сохраняем объект
  })) || [];

  return (
    <AutoComplete
      options={options}
      onSearch={(text) => setSearchValue(text)}
      onSelect={handleSelect}
      placeholder="Начните вводить адрес (город, улица...)"
      style={{ width: '100%', height: 40 }} // Чуть поменьше высотой
      notFoundContent={isLoading ? <div style={{padding: 10, textAlign: 'center'}}><Spin size="small" /></div> : null}
      allowClear
    />
  );
};