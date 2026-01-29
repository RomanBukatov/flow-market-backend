import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Table, Modal, Form, Input, InputNumber, message, Popconfirm, Avatar, Space, Typography, Select, Checkbox, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { shopApi } from '../../../../api/shop';
import { ImageUpload } from '../../../../components/ImageUpload';


const { Text } = Typography;

export const SellerProductsTab = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  // Пагинация и поиск
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Загрузка
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['my-products', page, pageSize, search],
    queryFn: () => shopApi.getMyProducts(page, pageSize, search),
  });

  // Сохранение (Создание / Обновление)
  const saveMutation = useMutation({
    mutationFn: (values: any) => {
      // 1. Очистка массива (убираем пустые слоты, если удаляли фото)
      const cleanedImages = values.images
          ? values.images.filter((img: string) => !!img) // Фильтруем null/undefined/пустые строки
          : [];

      const payload = {
          ...values,
          images: cleanedImages // Всегда отправляем массив, даже если пустой
      };

      if (editingProduct) {
        return shopApi.updateProduct(editingProduct.id, payload);
      } else {
        return shopApi.createProduct(payload);
      }
    },
    onSuccess: () => {
      message.success(editingProduct ? 'Товар обновлен' : 'Товар создан');
      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: () => message.error('Ошибка сохранения'),
  });

  // Удаление
  const deleteMutation = useMutation({
    mutationFn: (id: string) => shopApi.deleteProduct(id),
    onSuccess: () => {
      message.success('Товар удален');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });

  // КНОПКА СОЗДАТЬ
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // КНОПКА РЕДАКТИРОВАТЬ
  const handleEdit = (record: any) => {
    setEditingProduct(record);
    // ВАЖНО: Заполняем форму данными из товара
    form.setFieldsValue({
      name: record.name,
      basePrice: record.price, // В DTO с бэка приходит 'price', а не basePrice
      description: record.description,
      assemblyTimeMinutes: record.assemblyTimeMinutes,
      imageUrl: record.imageUrl,
      isDailyOffer: record.isDailyOffer,
      color: record.color || 'Микс',
      occasion: record.occasion || 'Без повода',
      // Массив картинок
      images: record.images || [] 
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Фото',
      dataIndex: 'imageUrl',
      render: (url: string) => <Avatar src={url} shape="square" size={50} />,
    },
    { title: 'Название', dataIndex: 'name' },
    { title: 'Цена', dataIndex: 'price', render: (p: number) => <b>{p} ₽</b> },
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Popconfirm title="Удалить?" onConfirm={() => deleteMutation.mutate(record.id)}>
                <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      className="static-card"
      title={`Мои товары (${pagedData?.totalCount || 0})`} 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Добавить</Button>}
    >
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <Input.Search 
            placeholder="Название товара..." 
            allowClear 
            enterButton="Поиск"
            size="large"
            onSearch={setSearch} 
            style={{ maxWidth: 400, width: '100%' }}
        />
        <Button size="large" onClick={() => setSearch('')}>Сброс</Button>
      </div>

      <Table 
        dataSource={pagedData?.items || []} 
        columns={columns} 
        rowKey="id" 
        loading={isLoading} 
        pagination={{
            current: page,
            pageSize: pageSize,
            total: pagedData?.totalCount,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: true
        }}
      />

      <Modal
        title={editingProduct ? "Редактировать" : "Новый товар"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <Form layout="vertical" form={form} onFinish={(vals) => saveMutation.mutate(vals)}>
          <Row gutter={16}>
             <Col span={16}>
                <Form.Item name="name" label="Название" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
             </Col>
             <Col span={8}>
                <Form.Item name="basePrice" label="Цена" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
             </Col>
          </Row>

          <Row gutter={16}>
             <Col span={12}>
                <Form.Item name="color" label="Цвет" initialValue="Микс">
                  <Select>
                    <Select.Option value="Красный">🔴 Красный</Select.Option>
                    <Select.Option value="Белый">⚪ Белый</Select.Option>
                    <Select.Option value="Розовый">🌸 Розовый</Select.Option>
                    <Select.Option value="Желтый">🟡 Желтый</Select.Option>
                    <Select.Option value="Микс">🎨 Микс</Select.Option>
                  </Select>
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item name="occasion" label="Повод" initialValue="Без повода">
                  <Select>
                    <Select.Option value="Без повода">😐 Без повода</Select.Option>
                    <Select.Option value="День рождения">🎂 ДР</Select.Option>
                    <Select.Option value="Свидание">❤️ Свидание</Select.Option>
                    <Select.Option value="Свадьба">💍 Свадьба</Select.Option>
                  </Select>
                </Form.Item>
             </Col>
          </Row>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
             <Col span={8}>
                 <Form.Item name="assemblyTimeMinutes" label="Сборка (мин)" initialValue={30}>
                    <InputNumber style={{ width: '100%' }} min={10} max={2880} controls={false} />
                 </Form.Item>
             </Col>
             <Col span={16} style={{ paddingTop: 30 }}>
                 <Form.Item name="isDailyOffer" valuePropName="checked">
                    <Checkbox>Собран сегодня (Таймер 24ч)</Checkbox>
                 </Form.Item>
             </Col>
          </Row>

          <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20 }}>
             <Text strong>Фотографии</Text>
             <div style={{ display: 'flex', gap: 15, marginTop: 10 }}>
                 {/* ГЛАВНОЕ ФОТО */}
                 <div style={{ width: 100 }}>
                    <div style={{ fontSize: 11, marginBottom: 5, color: '#888' }}>Главная</div>
                    <Form.Item name="imageUrl" noStyle rules={[{ required: true, message: 'Нужно фото' }]}>
                        <ImageUpload />
                    </Form.Item>
                 </div>

                 {/* ГАЛЕРЕЯ */}
                 <Form.List name="images">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <div key={field.key} style={{ width: 100, position: 'relative' }}>
                                    <div style={{ fontSize: 11, marginBottom: 5, color: '#888' }}>Доп. {field.name + 1}</div>
                                    <Form.Item {...field} noStyle>
                                        <ImageUpload />
                                    </Form.Item>
                                    <Button 
                                        type="text" danger size="small" icon={<DeleteOutlined />} 
                                        style={{ position: 'absolute', top: 22, right: -5, zIndex: 2, background: 'rgba(255,255,255,0.8)' }}
                                        onClick={() => remove(field.name)}
                                    />
                                </div>
                            ))}
                            {fields.length < 4 && (
                                <Button type="dashed" onClick={() => add()} style={{ width: 100, height: 100, marginTop: 22 }}>
                                    <PlusOutlined />
                                </Button>
                            )}
                        </>
                    )}
                 </Form.List>
             </div>
          </div>

          <Button type="primary" htmlType="submit" block size="large" loading={saveMutation.isPending}>
            Сохранить
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};