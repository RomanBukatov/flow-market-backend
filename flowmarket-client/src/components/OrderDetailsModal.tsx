import { Modal, List, Typography, Image, Descriptions, Tag, Space, Spin, Alert, Button, message } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import type { SellerOrder } from '../types/seller';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { translateStatus } from '../utils/formatters';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  initialData?: SellerOrder | null;
  viewMode: 'seller' | 'buyer'; 
}

export const OrderDetailsModal = ({ open, onClose, orderId, initialData, viewMode }: OrderDetailsModalProps) => {
  const { data: fetchedOrder, isLoading, isError } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => userApi.getOrderDetails(orderId!),
    enabled: !!orderId && !initialData && open,
    retry: false
  });

  const order = initialData || fetchedOrder;

  if (!open) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      case 'New': return 'orange';
      default: return 'blue';
    }
  };

  const handleWhatsApp = () => {
    if (!order) return;

    // ЛОГИКА ДЛЯ СЕЛЛЕРА (Пишем клиенту)
    if (viewMode === 'seller') {
        const phone = order.userPhone?.replace(/[^0-9]/g, '');
        if (!phone) {
            message.error('Телефон клиента не указан');
            return;
        }
        const text = `Здравствуйте! По поводу заказа #${order.subOrderId?.substring(0,8) || order.orderId} на MarioFlowers.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    }
    // ЛОГИКА ДЛЯ ПОКУПАТЕЛЯ (Пишем в поддержку/Виктору)
    else {
        // Тут пока хардкод номера поддержки (Виктора), т.к. телефона магазина в базе нет
        const supportPhone = "79000000000"; // <--- ЗАМЕНИТЬ НА НОМЕР ВИКТОРА
        const text = `Здравствуйте! У меня вопрос по заказу #${order.subOrderId?.substring(0,8) || order.orderId}.`;
        window.open(`https://wa.me/${supportPhone}?text=${encodeURIComponent(text)}`, '_blank');
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
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Дата создания">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Tag color={getStatusColor(order.status)}>{translateStatus(order.status)}</Tag>
            </Descriptions.Item>
            
            {/* Адрес показываем всегда */}
            <Descriptions.Item label="Адрес доставки">
              {order.userAddress || 'Скрыт'}
            </Descriptions.Item>

            {/* Телефон клиента показываем ТОЛЬКО СЕЛЛЕРУ */}
            {viewMode === 'seller' && (
                <Descriptions.Item label="Телефон клиента">
                    {order.userPhone || 'Скрыт'}
                </Descriptions.Item>
            )}

            <Descriptions.Item label="Общая сумма">
              <Typography.Text strong>{order.totalPrice} ₽</Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} style={{ marginBottom: 16 }}>Товары</Typography.Title>

          {/* Проверяем, есть ли товары */}
          {order.items && order.items.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={order.items}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Image src={item.imageUrl || "https://placehold.co/100"} width={60} style={{ borderRadius: 8 }} preview={false} />}
                    title={item.productName}
                    description={
                       <Space>
                         <span>{item.price} ₽ x {item.quantity} шт.</span>
                         <Typography.Text strong>
                           {item.price * item.quantity} ₽
                         </Typography.Text>
                       </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            /* КАРТИНКА, ЕСЛИ ПУСТО */
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <img
                src="/empty-cart.png" // Или /question-block.png
                alt="No items"
                style={{ width: 120, marginBottom: 15, opacity: 0.8 }}
              />
              <div style={{ color: '#999', fontSize: 16 }}>
                Информации о товарах нет
              </div>
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
                {/* МЕНЯЕМ ТЕКСТ КНОПКИ */}
                {viewMode === 'seller' ? 'Написать клиенту в WhatsApp' : 'Написать в Поддержку'}
             </Button>
          </div>

        </>
      )}
    </Modal>
  );
};