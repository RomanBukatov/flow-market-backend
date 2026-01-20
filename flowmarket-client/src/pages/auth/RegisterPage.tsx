import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Segmented } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ShopOutlined, SmileOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import type { RegisterDto } from '../../types/auth';
import { Link } from 'react-router-dom';
import { PhoneInput } from '../../components/PhoneInput';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

export const RegisterPage = () => {
  const [form] = Form.useForm();
  // Стейт для роли: 'buyer' | 'seller'
  const [roleType, setRoleType] = useState<string>('buyer');

  const registerMutation = useMutation({
    mutationFn: (values: RegisterDto) => authApi.register(values),
    onSuccess: (data) => {
      message.success(`Добро пожаловать, ${data.fullName}!`);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      
      // Если это продавец - кидаем сразу в создание магазина, если покупатель - в каталог
      // (Пока просто в каталог)
      window.location.href = '/catalog';
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ошибка регистрации');
    },
  });

  const onFinish = (values: any) => {
    const registerData: RegisterDto = {
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phoneNumber: values.phone,
      // Конвертируем наш стейт в число для бэкенда
      role: roleType === 'seller' ? 1 : 2, 
    };
    registerMutation.mutate(registerData);
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#f0f2f5'
    }}>
      <Helmet>
        <title>Регистрация | MarioFlowers</title>
      </Helmet>
      <Card className="static-card" style={{ width: 400, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ff6b6b', marginBottom: 20 }}>
          Регистрация
        </Title>

        {/* ПЕРЕКЛЮЧАТЕЛЬ РОЛИ */}
        <div style={{ marginBottom: 24 }}>
          <Segmented
            block
            size="large"
            value={roleType}
            onChange={setRoleType}
            options={[
              {
                label: (
                  <div style={{ padding: 4 }}>
                    <SmileOutlined /> Я Покупатель
                  </div>
                ),
                value: 'buyer',
              },
              {
                label: (
                  <div style={{ padding: 4 }}>
                    <ShopOutlined /> Я Продавец
                  </div>
                ),
                value: 'seller',
              },
            ]}
          />
        </div>

        <Form
          form={form}
          name="register"
          size="large"
          onFinish={onFinish}
          layout="vertical"
        >
          {/* Поля формы те же, но без Checkbox */}
          <Form.Item name="fullName" rules={[{ required: true, message: 'Введите имя' }]}>
            <Input prefix={<UserOutlined />} placeholder={roleType === 'seller' ? "Название организации / ИП" : "Ваше имя"} />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="phone" rules={[{ required: true }]}>
            <PhoneInput size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={registerMutation.isPending} 
              style={{ fontWeight: 'bold' }}
            >
              {roleType === 'seller' ? 'Стать партнером' : 'Зарегистрироваться'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        </div>
      </Card>
    </div>
  );
};