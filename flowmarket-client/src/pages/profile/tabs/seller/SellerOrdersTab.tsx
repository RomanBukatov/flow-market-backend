import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Tag, Button, message, Popconfirm, Grid, List, Select } from 'antd'; // <--- Grid используется
import { CloseOutlined } from '@ant-design/icons';
import { shopApi } from '../../../../api/shop';
import type { SellerOrder } from '../../../../types/seller';
import { OrderDetailsModal } from '../../../../components/OrderDetailsModal';
import { translateStatus, getStatusColor } from '../../../../utils/formatters';

// Достаем хук для адаптивности
const { useBreakpoint } = Grid;

export const SellerOrdersTab = () => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint(); // <--- ВОТ ЭТОЙ СТРОКИ НЕ ХВАТАЛО
  
  // Если экран меньше 'md' (планшета), считаем это мобилкой
  // (screens.md будет false на телефоне)
  const isMobile = !screens.md; 

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

  // Колонки для ПК версии
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
      title: 'Доставка',
      key: 'delivery',
      render: (_: any, r: SellerOrder) => (
        <div>
           {/* Проверяем, есть ли дата */}
           <div>📅 {r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : '-'}</div>
           <div style={{fontSize: 12, color: '#888'}}>⏰ {r.deliveryTimeSlot || ''}</div>
        </div>
      )
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
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Смена статуса */}
          <Select
            defaultValue={record.status}
            style={{ width: 130 }}
            onChange={(val) => {
              const statusMap: { [key: string]: number } = {
                'New': 2, // Confirmed
                'Assembling': 3,
                'Delivering': 5,
                'Completed': 6,
              };
              statusMutation.mutate({ id: record.subOrderId, status: statusMap[val] || 2 });
            }}
            disabled={record.status === 'Completed' || record.status === 'Cancelled'}
            options={[
              { value: 'New', label: '🆕 Новый' },
              { value: 'Assembling', label: '📦 В сборке' },
              { value: 'Delivering', label: '🚚 У курьера' },
              { value: 'Completed', label: '✅ Выполнен' },
            ]}
          />

          {/* Кнопка Отмены (Красный крестик) */}
          {record.status !== 'Completed' && record.status !== 'Cancelled' && (
             <Popconfirm title="Отменить заказ?" onConfirm={() => statusMutation.mutate({ id: record.subOrderId, status: 7 })}>
               <Button danger icon={<CloseOutlined />} />
             </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="static-card" title="Входящие заказы">
      {isMobile ? (
        /* --- МОБИЛЬНАЯ ВЕРСИЯ (СПИСОК) --- */
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
                  <Tag color={item.status === 'Completed' ? 'green' : item.status === 'New' ? 'orange' : 'blue'}>
                     {item.status}
                  </Tag>

                  <div style={{ display: 'flex', gap: 5 }}>
                    <Select
                      defaultValue={item.status}
                      style={{ width: 120 }}
                      onChange={(val) => {
                        const statusMap: { [key: string]: number } = {
                          'New': 2,
                          'Assembling': 3,
                          'Delivering': 5,
                          'Completed': 6,
                        };
                        statusMutation.mutate({ id: item.subOrderId, status: statusMap[val] || 2 });
                      }}
                      disabled={item.status === 'Completed' || item.status === 'Cancelled'}
                      options={[
                        { value: 'New', label: '🆕 Новый' },
                        { value: 'Assembling', label: '📦 В сборке' },
                        { value: 'Delivering', label: '🚚 У курьера' },
                        { value: 'Completed', label: '✅ Выполнен' },
                      ]}
                    />

                    {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                       <Popconfirm title="Отменить заказ?" onConfirm={() => statusMutation.mutate({ id: item.subOrderId, status: 7 })}>
                         <Button danger icon={<CloseOutlined />} />
                       </Popconfirm>
                    )}
                  </div>
               </div>
            </Card>
          )}
        />
      ) : (
        /* --- ПК ВЕРСИЯ (ТАБЛИЦА) --- */
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