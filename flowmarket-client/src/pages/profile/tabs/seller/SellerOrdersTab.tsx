import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import { shopApi } from '../../../../api/shop';
import type { SellerOrder } from '../../../../types/seller';
import { useState } from 'react';
import { OrderDetailsModal } from '../../../../components/OrderDetailsModal';

export const SellerOrdersTab = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: shopApi.getOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => shopApi.updateOrderStatus(id, status),
    onSuccess: () => {
      message.success('Статус обновлен');
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
  });

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Сумма',
      dataIndex: 'totalPrice',
      render: (p: number) => <span style={{fontWeight: 'bold'}}>{p} ₽</span>,
    },
    {
      title: 'Адрес',
      dataIndex: 'userAddress',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Completed') color = 'green';
        if (status === 'New') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: SellerOrder) => (
        <Space>
           {/* Если статус New (0), показываем кнопку "В работу" (например статус 3 - Assembling) */}
           {record.status === 'New' && (
             <Button 
               size="small" 
               type="primary"
               loading={statusMutation.isPending}
               onClick={() => statusMutation.mutate({ id: record.subOrderId, status: 3 })}
             >
               В работу
             </Button>
           )}

           {/* Если не Completed, показываем кнопку "Завершить" (6) */}
           {record.status !== 'Completed' && record.status !== 'Cancelled' && (
             <Popconfirm title="Заказ доставлен?" onConfirm={() => statusMutation.mutate({ id: record.subOrderId, status: 6 })}>
                <Button size="small" type="default" style={{ borderColor: 'green', color: 'green' }}>
                  Завершить
                </Button>
             </Popconfirm>
           )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="static-card" title="Входящие заказы">
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="subOrderId"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedOrder(record);
            setIsModalOpen(true);
          },
          style: { cursor: 'pointer' }
        })}
      />
      <OrderDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId={selectedOrder?.subOrderId || null}
        initialData={selectedOrder || undefined}
        viewMode="seller"
      />
    </Card>
  );
};