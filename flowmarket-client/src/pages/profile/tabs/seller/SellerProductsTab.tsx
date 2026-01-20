import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Button, Card, Table, Modal, Form, Input, InputNumber, message, Popconfirm, Avatar, Space, Row, Col, Select, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { shopApi } from '../../../../api/shop';
import { ImageUpload } from '../../../../components/ImageUpload';
import type { CreateProductDto } from '../../../../types/seller';

export const SellerProductsTab = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); 
  const [form] = Form.useForm();

  // Получаем магазин
  const { data: shop } = useQuery({ queryKey: ['my-shop'], queryFn: shopApi.getMyShop });
  
  // Стейт для пагинации и поиска
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Получаем товары с пагинацией и поиском
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['my-products', page, pageSize, search],
    queryFn: () => shopApi.getMyProducts(page, pageSize, search),
    enabled: !!shop?.id,
    placeholderData: keepPreviousData
  });

  // Мутация: Создание ИЛИ Обновление
  const saveMutation = useMutation({
    mutationFn: (values: CreateProductDto) => {
      if (editingProduct) {
        return shopApi.updateProduct(editingProduct.id, values);
      } else {
        return shopApi.createProduct(values);
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shopApi.deleteProduct(id),
    onSuccess: () => {
      message.success('Товар удален');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });

  // Открыть модалку для создания
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Открыть модалку для редактирования
  const handleEdit = (record: any) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      basePrice: record.price,
      description: record.description,
      assemblyTimeMinutes: record.assemblyTimeMinutes,
      imageUrl: record.imageUrl,
      isDailyOffer: record.isDailyOffer,
      color: record.color || null,
      occasion: record.occasion || null,
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Фото',
      dataIndex: 'imageUrl',
      render: (url: string) => <Avatar src={url} shape="square" size={50} />,
    },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price', render: (p: number) => `${p} ₽` },
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Popconfirm title="Удалить?" onConfirm={() => deleteMutation.mutate(record.id)}>
                <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
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

      {/* ПОИСК */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10 }}>
        <Input.Search
            placeholder="Название товара..."
            allowClear
            enterButton="Поиск" // Текст на кнопке
            size="large"
            onSearch={setSearch}
            style={{ maxWidth: 400, width: '100%' }} // Фиксируем ширину
        />
        {/* Если хочешь кнопку сброса рядом */}
        <Button size="large" onClick={() => setSearch('')}>Сброс</Button>
      </div>

      <Table
        dataSource={pagedData?.items || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        // СЕРВЕРНАЯ ПАГИНАЦИЯ
        pagination={{
            current: page,
            pageSize: pageSize,
            total: pagedData?.totalCount,
            onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
            },
            showSizeChanger: true
        }}
      />

      <Modal
        title={editingProduct ? "Редактировать товар" : "Новый товар"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={(vals) => saveMutation.mutate(vals)}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="basePrice" label="Цена" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              controls={false}
            />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="assemblyTimeMinutes" label="Время сборки (мин)" initialValue={30}>
            <InputNumber
              style={{ width: '100%' }}
              min={10}   // Минимум 10 минут
              max={2880} // Максимум 48 часов (2 дня)
              controls={false} // Без стрелок
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="color"
                label="Цвет"
                rules={[{ required: true, message: 'Выберите цвет' }]}
              >
                <Select placeholder="Выберите...">
                  <Select.Option value="Красный">🔴 Красный</Select.Option>
                  <Select.Option value="Белый">⚪ Белый</Select.Option>
                  <Select.Option value="Розовый">🌸 Розовый</Select.Option>
                  <Select.Option value="Желтый">🟡 Желтый</Select.Option>
                  <Select.Option value="Оранжевый">🟠 Оранжевый</Select.Option>
                  <Select.Option value="Фиолетовый">💜 Фиолетовый</Select.Option>
                  <Select.Option value="Синий">🔵 Синий</Select.Option>
                  <Select.Option value="Персиковый">🍑 Персиковый</Select.Option>
                  <Select.Option value="Зеленый">🟢 Зеленый</Select.Option>
                  <Select.Option value="Микс">🎨 Микс</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="occasion"
                label="Повод"
                rules={[{ required: true, message: 'Выберите повод' }]}
              >
                <Select placeholder="Выберите...">
                  <Select.Option value="Без повода">😐 Без повода</Select.Option>
                  <Select.Option value="День рождения">🎂 День рождения</Select.Option>
                  <Select.Option value="Свидание">❤️ Свидание</Select.Option>
                  <Select.Option value="Свадьба">💍 Свадьба</Select.Option>
                  <Select.Option value="Маме">👩‍👧 Маме</Select.Option>
                  <Select.Option value="Юбилей">🎉 Юбилей</Select.Option>
                  <Select.Option value="Коллеге">💼 Коллеге</Select.Option>
                  <Select.Option value="Извинение">🙏 Извинение</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="imageUrl" label="Фото">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="isDailyOffer" valuePropName="checked">
            <Checkbox>Собран сегодня (Таймер 24ч)</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={saveMutation.isPending}>
            Сохранить
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};