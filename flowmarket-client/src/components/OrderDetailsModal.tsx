import { Modal, List, Typography, Image, Descriptions, Tag, Space, Spin, Alert } from 'antd';
import type { SellerOrder } from '../types/seller';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  initialData?: SellerOrder | null; // Разрешаем null
}

export const OrderDetailsModal = ({ open, onClose, orderId, initialData }: OrderDetailsModalProps) => {
  // Хук вызывается всегда, но запрос идет только если есть ID и нет данных и окно открыто
  const { data: fetchedOrder, isLoading, isError } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => userApi.getOrderDetails(orderId!),
    enabled: !!orderId && !initialData && open,
    retry: false // Не долбить сервер, если ошибка
  });

  // Определяем, какие данные показывать
  const order = initialData || fetchedOrder;

  // Если окно закрыто - ничего не рендерим (но хук выше отработал в холостую, это норм)
  if (!open) return null;

  return (
    <Modal
      title={order ? `Заказ #${order.subOrderId?.substring(0, 8) || orderId}` : "Загрузка..."}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* 1. ЗАГРУЗКА */}
      {isLoading && !order && (
        <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
        </div>
      )}

      {/* 2. ОШИБКА */}
      {isError && !order && (
        <Alert
            message="Ошибка"
            description="Не удалось загрузить детали заказа."
            type="error"
            showIcon
        />
      )}

      {/* 3. ДАННЫЕ */}
      {order && (
        <>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Дата создания">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
                {order.status || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Телефон клиента">
              {order.userPhone || 'Скрыт'}
            </Descriptions.Item>
            <Descriptions.Item label="Адрес доставки">
              {order.userAddress || 'Скрыт'}
            </Descriptions.Item>
            <Descriptions.Item label="Общая сумма">
              <Typography.Text strong>
                {order.totalPrice || 0} ₽
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            Товары в заказе
          </Typography.Title>

          <List
            itemLayout="horizontal"
            dataSource={order.items || []} // Защита от null
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
        </>
      )}
    </Modal>
  );
};