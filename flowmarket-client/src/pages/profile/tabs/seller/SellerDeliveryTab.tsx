import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Table, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { shopApi } from '../../../../api/shop';
import type { CreateDeliveryZoneDto, DeliveryZone } from '../../../../api/shop';

export const SellerDeliveryTab = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. Получаем зоны
  const { data: zones, isLoading } = useQuery({
    queryKey: ['my-zones'],
    queryFn: shopApi.getZones,
  });

  // 2. Создаем зону
  const createMutation = useMutation({
    mutationFn: (data: CreateDeliveryZoneDto) => shopApi.createZone(data),
    onSuccess: () => {
      message.success('Зона добавлена');
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['my-zones'] });
    },
    onError: () => message.error('Ошибка добавления'),
  });

  // 3. Удаляем зону
  const deleteMutation = useMutation({
    mutationFn: (id: string) => shopApi.deleteZone(id),
    onSuccess: () => {
      message.success('Зона удалена');
      queryClient.invalidateQueries({ queryKey: ['my-zones'] });
    },
  });

  const columns = [
    { title: 'Название', dataIndex: 'zoneName', key: 'zoneName' },
    { 
      title: 'Радиус', 
      dataIndex: 'radiusKm', 
      key: 'radiusKm',
      render: (km: number) => <b>{km} км</b> 
    },
    { 
      title: 'Цена', 
      dataIndex: 'price', 
      key: 'price',
      render: (p: number) => `${p} ₽` 
    },
    { 
      title: 'Бесплатно от', 
      dataIndex: 'freeDeliveryThreshold', 
      key: 'freeDeliveryThreshold',
      render: (val?: number) => val ? `${val} ₽` : '-' 
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: DeliveryZone) => (
        <Popconfirm title="Удалить зону?" onConfirm={() => deleteMutation.mutate(record.id)}>
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card 
      className="static-card"
      title="Настройки доставки" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Добавить зону</Button>}
    >
      <div style={{ marginBottom: 15, color: '#666', fontSize: 13 }}>
        <EnvironmentOutlined /> Укажите, как далеко и за сколько вы готовы везти заказы.
        Калькулятор выберет подходящую зону автоматически.
      </div>

      <Table dataSource={zones} columns={columns} rowKey="id" loading={isLoading} pagination={false} />

      {/* МОДАЛКА СОЗДАНИЯ */}
      <Modal
        title="Новая зона доставки"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form layout="vertical" form={form} onFinish={(vals) => createMutation.mutate(vals)}>
          <Form.Item name="zoneName" label="Название зоны" rules={[{ required: true }]} initialValue="Город">
            <Input placeholder="Например: Центр" />
          </Form.Item>
          
          <Form.Item name="radiusKm" label="Радиус (км)" rules={[{ required: true }]} initialValue={10}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          
          <Form.Item name="price" label="Стоимость доставки (₽)" rules={[{ required: true }]} initialValue={300}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          
          <Form.Item name="freeDeliveryThreshold" label="Бесплатно при заказе от (₽)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Оставьте пустым, если нет" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            Сохранить зону
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};