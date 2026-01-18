import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'; // Убрал PhoneOutlined
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import type { RegisterDto } from '../../types/auth';
import { Link } from 'react-router-dom';
import { PhoneInput } from '../../components/PhoneInput'; // Наш компонент

const { Title } = Typography;

export const RegisterPage = () => {
  const [form] = Form.useForm();

  const registerMutation = useMutation({
    mutationFn: (values: RegisterDto) => authApi.register(values),
    onSuccess: (data) => {
      message.success(`Привет, ${data.fullName}!`);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      window.location.href = '/catalog';
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ошибка регистрации');
    },
  });

  const onFinish = (values: any) => {
    // Очищаем телефон от маски (скобок и пробелов), если бэкенд ждет чистые цифры
    // Но если бэкенд всеяден, можно слать как есть.
    // Для надежности лучше сохранить формат "+7 (999)..." или почистить.
    // Пока шлем как есть.

    const registerData: RegisterDto = {
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phoneNumber: values.phone, // Значение придет из PhoneInput
      role: values.isSeller ? 1 : 2,
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
        <Title level={2} style={{ color: '#ff6b6b', marginBottom: 30 }}>
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
            rules={[{ required: true, message: 'Введите Email!' }, { type: 'email', message: 'Неверный формат!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Введите телефон!' }]}
          >
            {/* ИСПОЛЬЗУЕМ НАШ КОМПОНЕНТ */}
            <PhoneInput size="large" placeholder="+7 (999) 000-00-00" />
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