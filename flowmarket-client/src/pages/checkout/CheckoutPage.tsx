import { Card, Form, Button, List, Typography, message, Result, Checkbox } from 'antd';
import { useCartStore } from '../../store/cartStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import type { CreateOrderDto } from '../../api/orders';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressInput } from '../../components/AddressInput';
import { shopApi } from '../../api/shop';
import { userApi } from '../../api/user';
import { PhoneInput } from '../../components/PhoneInput';
import { Helmet } from 'react-helmet-async';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [successData, setSuccessData] = useState<any>(null);
  
  // Стейт доставки
  const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<{address: string, lat: number, lon: number} | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<dayjs.Dayjs | null>(null);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);

  const token = localStorage.getItem('token'); // Проверяем токен

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
    enabled: !!token, // <--- ГРУЗИМ ТОЛЬКО ЕСЛИ ЕСТЬ ТОКЕН
    retry: false
  });
  const [useBonuses, setUseBonuses] = useState(false);

  const productsTotal = getTotalPrice();
  const bonusesAvailable = profile?.bonusBalance || 0;
  const bonusesToUse = useBonuses ? Math.min(bonusesAvailable, productsTotal * 0.5) : 0;
  const finalTotal = productsTotal + (deliveryPrice || 0) - bonusesToUse;

  // Обработчик выбора адреса
  const handleAddressSelect = (address: string, lat: number, lon: number) => {
    setAddressData({ address, lat, lon });
    calculateDelivery(lat, lon);
  };

  // Функция расчета
  const calculateDelivery = async (lat: number, lon: number) => {
    if (items.length === 0) return;
    
    // Берем ID магазина из первого товара (упрощение для MVP)
    const shopId = items[0].shopId;
    
    try {
      setDeliveryError(null);
      const result = await shopApi.calculateDelivery({
        shopId: shopId,
        userLatitude: lat,
        userLongitude: lon,
        orderTotalAmount: productsTotal
      });
      setDeliveryPrice(result.price);
      message.success(`Доставка: ${result.price} ₽`);
    } catch (err: any) {
      setDeliveryPrice(null);
      setDeliveryError(err.response?.data?.message || "Не удалось рассчитать доставку");
      message.error("Адрес вне зоны доставки!");
    }
  };

  // Слоты времени (хардкод, как в ТЗ)
  const timeSlots = [
    '09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00', '21:00 - 00:00'
  ];

  // Мутация создания заказа
  const createOrderMutation = useMutation({
    mutationFn: (values: any) => {
      const dto: CreateOrderDto = {
        userPhone: values.phone,
        userAddress: addressData?.address || values.address, // Берем из DaData
        userLatitude: addressData?.lat || 0, // <--- Передаем
        userLongitude: addressData?.lon || 0, // <--- Передаем
        bonusesToUse: bonusesToUse,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : new Date().toISOString(),
        deliveryTimeSlot: timeSlot || 'Как можно скорее',
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
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <Result
          icon={
            <img
              src="/success.png"
              alt="Success"
              style={{ width: 120, marginBottom: 10 }}
            />
          }
          title="Заказ оформлен!"
          subTitle={
            <span>
              Номер заказа: <b>{successData.orderId.substring(0, 8)}...</b><br/>
              Сумма: <b>{successData.totalAmount} ₽</b>
            </span>
          }
          extra={[
            <Button type="primary" size="large" key="pay" onClick={() => window.location.href = successData.paymentLink}>
              ПЕРЕЙТИ К ОПЛАТЕ
            </Button>,
            <Button size="large" key="home" onClick={() => navigate('/catalog')}>
              В магазин
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <Helmet>
        <title>Оформление заказа | MarioFlowers</title>
      </Helmet>
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
        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <div>Товары: {productsTotal} ₽</div>
          <div>Доставка: {deliveryPrice !== null ? `${deliveryPrice} ₽` : '---'}</div>
          {bonusesToUse > 0 && <div>Бонусы: -{bonusesToUse} ₽</div>}
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
            Итого: {finalTotal} ₽
          </div>
        </div>
      </Card>

      <Card title="Данные доставки">
        <Form layout="vertical" onFinish={(values) => createOrderMutation.mutate(values)}>
          <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}>
            <PhoneInput size="large" />
          </Form.Item>
          
          <Form.Item label="Адрес доставки" required help={deliveryError} validateStatus={deliveryError ? 'error' : ''}>
            <AddressInput onSelect={handleAddressSelect} />
            {/* Скрытый инпут, чтобы форма видела значение для валидации, если нужно,
                но лучше просто использовать стейт addressData при отправке */}
           </Form.Item>

           <Form.Item label="Дата и время доставки" required>
            <div style={{ display: 'flex', gap: 10 }}>
              <DatePicker
                style={{ flex: 1 }}
                placeholder="Дата"
                value={deliveryDate}
                onChange={setDeliveryDate}
                minDate={dayjs()} // Нельзя выбрать прошлое
              />
              <Select
                style={{ flex: 1 }}
                placeholder="Интервал"
                value={timeSlot}
                onChange={setTimeSlot}
                options={timeSlots.map(t => ({ label: t, value: t }))}
              />
            </div>
           </Form.Item>

           {profile && bonusesAvailable > 0 && (
             <Card size="small" style={{ marginBottom: 15, background: '#fffbe6' }}>
               <Checkbox checked={useBonuses} onChange={e => setUseBonuses(e.target.checked)}>
                 Списать бонусы (доступно: {bonusesAvailable} Б)
               </Checkbox>
               {useBonuses && <div style={{ color: 'green', fontSize: 12 }}>Будет списано: {bonusesToUse} ₽</div>}
             </Card>
           )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={createOrderMutation.isPending}
            style={{ marginTop: 10 }}
            disabled={!!deliveryError || deliveryPrice === null}
          >
            Подтвердить и Оплатить
          </Button>
        </Form>
      </Card>
    </div>
  );
};