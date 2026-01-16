import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Tag, Button, Space, message, Popconfirm, Grid, List } from 'antd'; // <--- Grid используется
import { shopApi } from '../../../../api/shop';
import type { SellerOrder } from '../../../../types/seller';
import { OrderDetailsModal } from '../../../../components/OrderDetailsModal';

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
           {record.status === 'New' && (
             <Button 
               size="small" 
               type="primary"
               loading={statusMutation.isPending}
               onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: record.subOrderId, status: 3 }) }}
             >
               В работу
             </Button>
           )}

           {record.status !== 'Completed' && record.status !== 'Cancelled' && (
             <Popconfirm 
                title="Заказ доставлен?" 
                onConfirm={(e) => { e?.stopPropagation(); statusMutation.mutate({ id: record.subOrderId, status: 6 }) }}
                onCancel={(e) => e?.stopPropagation()}
             >
                <Button 
                    size="small" 
                    type="default" 
                    style={{ borderColor: 'green', color: 'green' }}
                    onClick={(e) => e.stopPropagation()}
                >
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
                  
                  <Space>
                     {item.status === 'New' && (
                       <Button 
                         size="small" 
                         type="primary" 
                         onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: item.subOrderId, status: 3 }) }}
                       >
                         В работу
                       </Button>
                     )}
                     
                     {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                       <Popconfirm 
                            title="Завершить?" 
                            onConfirm={(e) => { e?.stopPropagation(); statusMutation.mutate({ id: item.subOrderId, status: 6 }) }}
                            onCancel={(e) => e?.stopPropagation()}
                        >
                            <Button size="small" onClick={(e) => e.stopPropagation()}>
                                Завершить
                            </Button>
                       </Popconfirm>
                     )}
                  </Space>
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