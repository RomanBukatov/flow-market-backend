import { Card, Form, Input, Button, List, Typography, message, Result } from 'antd';
import { useCartStore } from '../../store/cartStore';
import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import type { CreateOrderDto } from '../../api/orders';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [successData, setSuccessData] = useState<any>(null);

  // Мутация создания заказа
  const createOrderMutation = useMutation({
    mutationFn: (values: any) => {
      const dto: CreateOrderDto = {
        userPhone: values.phone,
        userAddress: values.address,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
      };
      return ordersApi.createOrder(dto);
    },
    onSuccess: (data) => {
      clearCart();
      setSuccessData(data); // Показываем экран успеха
      // Можно сразу редиректить на оплату:
      // window.location.href = data.paymentLink;
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Ошибка при создании заказа");
    }
  });

  // Если корзина пустая и нет успеха - редирект в каталог
  if (items.length === 0 && !successData) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Result
          status="info"
          title="Корзина пуста"
          extra={<Button type="primary" onClick={() => navigate('/catalog')}>В каталог</Button>}
        />
      </div>
    );
  }

  // Экран успеха
  if (successData) {
    return (
      <div style={{ padding: 50 }}>
        <Result
          status="success"
          title="Заказ оформлен!"
          subTitle={`Номер заказа: ${successData.orderId}. Сумма: ${successData.totalAmount} ₽`}
          extra={[
            <Button type="primary" key="pay" onClick={() => window.location.href = successData.paymentLink}>
              Перейти к оплате
            </Button>,
            <Button key="home" onClick={() => navigate('/catalog')}>В магазин</Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <Title level={2}>Оформление заказа</Title>
      
      <Card title={`Товары (${items.length})`} style={{ marginBottom: 20 }}>
        <List
          dataSource={items}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta title={item.name} description={`${item.price} ₽ x ${item.quantity} шт.`} />
              <div>{item.price * item.quantity} ₽</div>
            </List.Item>
          )}
        />
        <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 'bold', fontSize: 18 }}>
          Итого: {getTotalPrice()} ₽
        </div>
      </Card>

      <Card title="Данные доставки">
        <Form layout="vertical" onFinish={(values) => createOrderMutation.mutate(values)}>
          <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}>
            <Input placeholder="+7 (999) 000-00-00" size="large" />
          </Form.Item>
          
          <Form.Item name="address" label="Адрес доставки" rules={[{ required: true, message: 'Введите адрес' }]}>
            <Input.TextArea placeholder="Город, улица, дом, подъезд" rows={3} />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={createOrderMutation.isPending}
            style={{ marginTop: 10 }}
          >
            Подтвердить и Оплатить
          </Button>
        </Form>
      </Card>
    </div>
  );
};