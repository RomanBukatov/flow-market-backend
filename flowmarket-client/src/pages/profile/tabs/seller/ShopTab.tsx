import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Form, Input, Spin, Typography, message, Result, Modal, Row, Col, InputNumber, Select } from 'antd';
import { ImageUpload } from '../../../../components/ImageUpload';
import { ShopOutlined, PlusOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { shopApi } from '../../../../api/shop';
import type { CreateShopDto, UpdateShopDto } from '../../../../types/seller';
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock';
import { REAL_CITIES } from '../../../../store/cityStore';

const { Title, Text } = Typography;

export const ShopTab = () => {
  const queryClient = useQueryClient();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Блокируем скролл, когда модалка открыта
  useBodyScrollLock(isEditModalOpen);

  // 1. Получаем магазин
  const { data: shop, isLoading } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopApi.getMyShop,
  });

  // 2. Создание
  const createMutation = useMutation({
    mutationFn: (data: CreateShopDto) => shopApi.createShop(data),
    onSuccess: () => {
      message.success('Магазин успешно создан!');
      queryClient.invalidateQueries({ queryKey: ['my-shop'] });
    },
    onError: () => message.error('Ошибка при создании'),
  });

  // 3. Обновление (Редактирование)
  const updateMutation = useMutation({
    mutationFn: (data: UpdateShopDto) => shopApi.updateShop(data),
    onSuccess: () => {
      message.success('Настройки обновлены');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-shop'] });
    },
    onError: () => message.error('Не удалось обновить магазин'),
  });

  const handleEditClick = () => {
    // Заполняем форму текущими данными перед открытием
    editForm.setFieldsValue({
      description: shop?.description,
      city: shop?.city,
      logoUrl: shop?.logoUrl,
      // Если координат нет, ставим дефолт (Екб)
      latitude: shop?.latitude || 56.8389,
      longitude: shop?.longitude || 60.5974,
    });
    setIsEditModalOpen(true);
  };

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

  // --- ВАРИАНТ 1: НЕТ МАГАЗИНА (ФОРМА СОЗДАНИЯ) ---
  if (!shop) {
    return (
      <Card className="static-card" title="Создание магазина" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Result
          icon={<ShopOutlined style={{ color: '#ff6b6b' }} />}
          title="Добро пожаловать в MarioFlowers!"
          subTitle="Создайте свой магазин, чтобы начать принимать заказы."
        />
        <Form layout="vertical" form={createForm} onFinish={(vals) => createMutation.mutate(vals)}>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="name" label="Название" rules={[{ required: true }]}>
                    <Input placeholder="Например: Ромашка" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="city" label="Город" rules={[{ required: true, message: 'Выберите город' }]}>
                  <Select placeholder="Выберите из списка">
                    {REAL_CITIES.map(city => (
                      <Select.Option key={city} value={city}>{city}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Введите описание магазина' }]}>
            <Input.TextArea rows={3} placeholder="Расскажите о себе..." />
          </Form.Item>
          <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20 }}>
            <Text strong>📍 Геолокация (для расчета доставки)</Text>
            <Row gutter={16} style={{ marginTop: 10 }}>
              <Col span={12}>
                <Form.Item name="latitude" label="Широта" rules={[{ required: true }]} initialValue={56.8389}>
                  <InputNumber style={{ width: '100%' }} precision={6} controls={false} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="longitude" label="Долгота" rules={[{ required: true }]} initialValue={60.5974}>
                  <InputNumber style={{ width: '100%' }} precision={6} controls={false} />
                </Form.Item>
              </Col>
            </Row>
            <Text type="secondary" style={{ marginTop: 10, display: 'block' }}>Координаты можно посмотреть в Яндекс Картах</Text>
          </div>
          <Button type="primary" htmlType="submit" block size="large" icon={<PlusOutlined />} loading={createMutation.isPending}>
            Открыть Магазин
          </Button>
        </Form>
      </Card>
    );
  }

  // --- ВАРИАНТ 2: ЕСТЬ МАГАЗИН (ИНФО + РЕДАКТИРОВАНИЕ) ---
  return (
    <>
      <Card className="static-card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
           {/* Логотип или Заглушка */}
           <div style={{ 
               width: 100, height: 100, borderRadius: '50%', background: '#eee', 
               margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
               overflow: 'hidden', border: '4px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
           }}>
              {shop.logoUrl && shop.logoUrl.startsWith('http') 
                ? <img src={shop.logoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                : <ShopOutlined style={{ fontSize: 40, color: '#999' }} />
              }
           </div>

           <Title level={2} style={{ margin: 0 }}>{shop.name}</Title>
           <Text type="secondary"><EnvironmentOutlined /> {shop.city}</Text>
           
           <div style={{ marginTop: 20, maxWidth: 600, margin: '20px auto', color: '#555' }}>
             {shop.description || "Описание отсутствует"}
           </div>

           <Button 
             type="primary" 
             icon={<EditOutlined />} 
             size="large" 
             style={{ minWidth: 200 }}
             onClick={handleEditClick}
           >
             Редактировать
           </Button>
        </div>
      </Card>

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ */}
      <Modal
        title="Настройки магазина"
        open={isEditModalOpen}
        centered
        onCancel={() => setIsEditModalOpen(false)}
        footer={null} // Скрываем стандартные кнопки, используем свои в форме
      >
        <Form layout="vertical" form={editForm} onFinish={(vals) => updateMutation.mutate(vals)}>
          <Form.Item name="city" label="Город" rules={[{ required: true, message: 'Выберите город' }]}>
            <Select placeholder="Выберите из списка">
              {REAL_CITIES.map(city => (
                <Select.Option key={city} value={city}>{city}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item name="logoUrl" label="Логотип">
           <ImageUpload />
         </Form.Item>

          <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20 }}>
            <Text strong>📍 Геолокация (для расчета доставки)</Text>
            <div style={{ marginTop: 10, fontSize: 12, color: '#888', marginBottom: 10 }}>
              Возьмите координаты из Яндекс.Карт, чтобы калькулятор доставки работал точно.
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="latitude" label="Широта (Lat)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} precision={6} controls={false} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="longitude" label="Долгота (Lon)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} precision={6} controls={false} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Button type="primary" htmlType="submit" block size="large" loading={updateMutation.isPending}>
            Сохранить изменения
          </Button>
        </Form>
      </Modal>
    </>
  );
};
