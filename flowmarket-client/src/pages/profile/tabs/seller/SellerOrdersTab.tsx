import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Tag, message, Grid, List, Select } from 'antd'; // <--- Убрал Button, Popconfirm
// Убрал CloseOutlined, так как он не используется
import { shopApi } from '../../../../api/shop';
import type { SellerOrder } from '../../../../types/seller';
import { OrderDetailsModal } from '../../../../components/OrderDetailsModal';
import { translateStatus, getStatusColor } from '../../../../utils/formatters';

const { useBreakpoint } = Grid;

export const SellerOrdersTab = () => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md; 

  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: shopApi.getOrders,
  });

  // ИСПРАВЛЕНИЕ ТИПА: status: number
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => shopApi.updateOrderStatus(id, status),
    onSuccess: () => {
      message.success('Статус обновлен');
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: () => message.error('Ошибка обновления')
  });

  // Опции для селекта (ЦИФРЫ!)
  // 0=PendingPayment, 1=Paid, 2=Confirmed, 3=Assembling, 4=PhotoReady, 5=Delivering, 6=Completed, 7=Cancelled
  const statusOptions = [
    { value: 1, label: '💰 Оплачен (Новый)' }, 
    { value: 3, label: '📦 В сборке' },
    { value: 4, label: '📸 Фото готово' },
    { value: 5, label: '🚚 У курьера' },
    { value: 6, label: '✅ Выполнен' },
    { value: 7, label: '❌ Отмена' },
  ];

  // Хелпер для конвертации строки статуса (с бэка) в число (для defaultValue селекта)
  // Если бэк шлет "Paid", нам надо превратить это в 1, чтобы селект понял, что выбрано.
  const getStatusValue = (statusStr: string | number): number => {
      // Если уже число - возвращаем
      if (typeof statusStr === 'number') return statusStr;
      
      switch(statusStr) {
          case 'PendingPayment': return 0;
          case 'Paid': return 1;
          case 'New': return 1; // Иногда мапится так
          case 'Confirmed': return 2;
          case 'Assembling': return 3;
          case 'PhotoReady': return 4;
          case 'Delivering': return 5;
          case 'Completed': return 6;
          case 'Cancelled': return 7;
          default: return 1;
      }
  };

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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {translateStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: SellerOrder) => (
        <div onClick={(e) => e.stopPropagation()}>
            <Select
              defaultValue={getStatusValue(record.status)}
              style={{ width: 150 }}
              onChange={(val) => statusMutation.mutate({ id: record.subOrderId, status: val })}
              disabled={record.status === 'Completed' || record.status === 'Cancelled'}
              options={statusOptions}
            />
        </div>
      ),
    },
  ];

  return (
    <Card className="static-card" title="Входящие заказы">
      {isMobile ? (
        <List
          dataSource={orders}
          loading={isLoading}
          renderItem={(item) => (
            <Card 
              size="small" 
              style={{ marginBottom: 10, border: '1px solid #f0f0f0' }}
              onClick={() => { setSelectedOrder(item); setIsModalOpen(true); }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontWeight: 'bold' }}>#{item.subOrderId.substring(0, 8)}</span>
                  <span style={{ color: '#888' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
               </div>
               
               <div style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 13 }}>📍 {item.userAddress}</div>
                  <div style={{ fontWeight: 'bold', fontSize: 16, marginTop: 5 }}>{item.totalPrice} ₽</div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <Tag color={getStatusColor(item.status)}>
                     {translateStatus(item.status)}
                  </Tag>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        defaultValue={getStatusValue(item.status)}
                        style={{ width: 140 }}
                        onChange={(val) => statusMutation.mutate({ id: item.subOrderId, status: val })}
                        disabled={item.status === 'Completed' || item.status === 'Cancelled'}
                        options={statusOptions}
                        size="small"
                      />
                  </div>
               </div>
            </Card>
          )}
        />
      ) : (
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
      )}
      
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