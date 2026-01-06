import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import type { LoginDto } from '../../types/auth';

const { Title } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();

  // Хук для отправки запроса (React Query)
  const loginMutation = useMutation({
    mutationFn: (values: LoginDto) => authApi.login(values),
    onSuccess: (data) => {
      message.success(`Привет, ${data.fullName}!`);
      // Сохраняем токен
      localStorage.setItem('token', data.token);
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
      <Card style={{ width: 380, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ff4d4f', marginBottom: 30 }}>
          Mario Flowers
        </Title>
        
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
      </Card>
    </div>
  );
};
