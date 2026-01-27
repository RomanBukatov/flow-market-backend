import { Modal, List, Typography, Image, Descriptions, Tag, Spin, Alert, Button, message, Select, Popconfirm } from 'antd';
// Убрал Space из импорта
import { WhatsAppOutlined, CloseOutlined } from '@ant-design/icons';
import type { SellerOrder } from '../types/seller';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { shopApi } from '../api/shop';
import { translateStatus, getStatusColor } from '../utils/formatters';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  initialData?: SellerOrder | null;
  viewMode: 'seller' | 'buyer';
}

export const OrderDetailsModal = ({ open, onClose, orderId, initialData, viewMode }: OrderDetailsModalProps) => {
  const queryClient = useQueryClient();

  const { data: fetchedOrder, isLoading, isError } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => userApi.getOrderDetails(orderId!),
    enabled: !!orderId && !initialData && open,
    retry: false
  });

  const order = initialData || fetchedOrder;

  // Мутация для смены статуса (принимает number)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => shopApi.updateOrderStatus(id, status),
    onSuccess: () => {
      message.success('Статус обновлен');
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      onClose();
    },
    onError: () => message.error('Ошибка обновления статуса')
  });

  if (!open) return null;

  const handleWhatsApp = () => {
    // Используем опциональную цепочку ?. чтобы TS не ругался на возможный null
    if (viewMode === 'seller') {
        const phone = order?.userPhone?.replace(/[^0-9]/g, '');
        if (!phone) { message.error('Телефон клиента не указан'); return; }
        const text = `Здравствуйте! По поводу заказа #${order?.subOrderId?.substring(0,8) || order?.orderId} на MarioFlowers.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
        const supportPhone = "79000000000"; 
        const text = `Здравствуйте! Вопрос по заказу #${order?.subOrderId?.substring(0,8) || order?.orderId}.`;
        window.open(`https://wa.me/${supportPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Хелпер для конвертации статуса из строки (если пришел "New") в число для Select
  const getStatusValue = (statusStr: string | number): number => {
      if (typeof statusStr === 'number') return statusStr;
      switch(statusStr) {
          case 'PendingPayment': return 0;
          case 'Paid': return 1;
          case 'New': return 1; // Допустим Paid = New для селлера
          case 'Assembling': return 3;
          case 'PhotoReady': return 4;
          case 'Delivering': return 5;
          case 'Completed': return 6;
          case 'Cancelled': return 7;
          default: return 1;
      }
  };

  return (
    <Modal
      title={order ? `Заказ #${order.subOrderId?.substring(0, 8) || orderId}` : "Загрузка..."}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {isLoading && !order && <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}
      
      {isError && !order && <Alert message="Ошибка" description="Не удалось загрузить детали." type="error" />}

      {order && (
        <>
          {viewMode === 'seller' && (
            <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20, border: '1px solid #eee' }}>
               <div style={{ marginBottom: 8, fontWeight: 600 }}>Управление заказом:</div>
               <div style={{ display: 'flex', gap: 10 }}>
                  <Select
                      // Превращаем текущий статус в число, чтобы Select понял, что выбрано
                      defaultValue={getStatusValue(order.status)}
                      style={{ flex: 1 }}
                      // Передаем числовое значение в мутацию
                      onChange={(val) => statusMutation.mutate({ id: order.subOrderId, status: val })}
                      disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                      options={[
                        // Значения совпадают с C# Enum
                        { value: 1, label: '💰 Оплачен (Новый)' }, 
                        { value: 3, label: '📦 В сборке' },
                        { value: 4, label: '📸 Фото готово' },
                        { value: 5, label: '🚚 У курьера' },
                        { value: 6, label: '✅ Выполнен' },
                      ]}
                  />
                  
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                     <Popconfirm title="Отменить заказ?" onConfirm={() => statusMutation.mutate({ id: order.subOrderId, status: 7 })}>
                        <Button danger icon={<CloseOutlined />}>Отмена</Button>
                     </Popconfirm>
                  )}
               </div>
            </div>
          )}

          <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Дата создания">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Статус">
              <Tag color={getStatusColor(order.status)}>{translateStatus(order.status)}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Адрес доставки">
              {order.userAddress || 'Скрыт'}
            </Descriptions.Item>

            {viewMode === 'seller' && (
               <Descriptions.Item label="Телефон клиента">
                  {order.userPhone || 'Скрыт'}
               </Descriptions.Item>
            )}

            <Descriptions.Item label={viewMode === 'seller' ? "Ваша выручка (70%)" : "Итого к оплате"}>
              <Typography.Text strong style={{ fontSize: 18, color: viewMode === 'seller' ? 'green' : 'black' }}>
                {order.totalPrice} ₽
              </Typography.Text>
              {viewMode === 'seller' && <span style={{fontSize: 12, color: '#999', marginLeft: 10}}>(Комиссия 30% удержана)</span>}
            </Descriptions.Item>

             {/* Исправленная проверка на наличие даты доставки */}
             {order.deliveryDate && (
                <Descriptions.Item label="Время доставки">
                    {new Date(order.deliveryDate).toLocaleDateString()} {order.deliveryTimeSlot}
                </Descriptions.Item>
             )}
          </Descriptions>

          <Typography.Title level={5} style={{ marginBottom: 16 }}>Товары</Typography.Title>

          {order.items && order.items.length > 0 ? (
            <List
                itemLayout="horizontal"
                dataSource={order.items}
                renderItem={(item: any) => (
                <List.Item>
                    <List.Item.Meta
                    avatar={<Image src={item.imageUrl || "https://placehold.co/100"} width={60} style={{ borderRadius: 8 }} preview={false} />}
                    title={item.productName}
                    description={`${item.price} ₽ x ${item.quantity} шт.`}
                    />
                    <div style={{ fontWeight: 'bold' }}>{item.price * item.quantity} ₽</div>
                </List.Item>
                )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
               Нет информации о товарах
            </div>
          )}

          <div style={{ marginTop: 24 }}>
             <Button 
                block 
                size="large"
                icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />}
                style={{ borderColor: '#25D366', color: '#25D366', height: 50, fontWeight: 600 }}
                onClick={handleWhatsApp}
             >
                {viewMode === 'seller' ? 'Написать клиенту в WhatsApp' : 'Написать в Поддержку'}
             </Button>
          </div>

        </>
      )}
    </Modal>
  );
};