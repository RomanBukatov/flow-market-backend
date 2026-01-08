import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import type { RegisterDto } from '../../types/auth';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export const RegisterPage = () => {
  const [form] = Form.useForm();

  // Хук для отправки запроса (React Query)
  const registerMutation = useMutation({
    mutationFn: (values: RegisterDto) => authApi.register(values),
    onSuccess: (data) => {
      message.success(`Привет, ${data.fullName}!`);
      // Сохраняем токен
      localStorage.setItem('token', data.token);
      window.location.href = '/catalog'; // Простой редирект
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
      role: values.isSeller ? 1 : 2, // 1=Seller, 2=Buyer
    };
    registerMutation.mutate(registerData);
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
          Mario Flowers
        </Title>

        <Form
          form={form}
          name="register"
          size="large"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Введите полное имя!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Полное имя" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Введите Email!' }, { type: 'email', message: 'Неверный формат Email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Введите телефон!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Телефон" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item name="isSeller" valuePropName="checked">
            <Checkbox>Хочу стать продавцом</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={registerMutation.isPending}
            >
              Зарегистрироваться
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