import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Segmented } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, SmileOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import type { LoginDto } from '../../types/auth';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const [loginType, setLoginType] = useState('buyer'); // Чисто визуальный стейт

  // Хук для отправки запроса (React Query)
  const loginMutation = useMutation({
    mutationFn: (values: LoginDto) => authApi.login(values),
    onSuccess: (data) => {
      message.success(`Привет, ${data.fullName}!`);
      // Сохраняем токен
      localStorage.setItem('token', data.token);
      // Сохраняем роль
      localStorage.setItem('userRole', data.role);
      window.location.href = '/catalog'; // Простой редирект
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ошибка входа');
    },
  });

  const onFinish = (values: LoginDto) => {
    loginMutation.mutate(values);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#f0f2f5' 
    }}>
      <Card className="static-card" style={{ width: 380, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ff4d4f', marginBottom: 30 }}>
          Вход
        </Title>

        {/* Визуальный переключатель (не влияет на логику, но успокаивает клиента) */}
        <div style={{ marginBottom: 24 }}>
          <Segmented
            block
            size="large"
            value={loginType}
            onChange={setLoginType}
            options={[
              { label: <span><SmileOutlined /> Покупатель</span>, value: 'buyer' },
              { label: <span><ShopOutlined /> Продавец</span>, value: 'seller' },
            ]}
          />
        </div>

        <Form
          form={form}
          name="login"
          size="large"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Введите Email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loginMutation.isPending}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
        </div>
      </Card>
    </div>
  );
};
