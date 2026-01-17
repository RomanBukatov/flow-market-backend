import { useState } from 'react';
import { Card, Descriptions, Button, Modal, Form, Input, message } from 'antd';
import { LogoutOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../../api/user';
import { userApi } from '../../../api/user';

export const SettingsTab = ({ profile }: { profile: UserProfile | undefined }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mario-cart-storage');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const updateMutation = useMutation({
    mutationFn: (values: { fullName: string; phoneNumber: string }) => userApi.updateProfile(values),
    onSuccess: () => {
      message.success('Профиль обновлен');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => message.error('Ошибка обновления'),
  });

  const openEdit = () => {
    form.setFieldsValue({
      fullName: profile?.fullName,
      phoneNumber: profile?.phone,
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <Card className="static-card" title="Мои данные" extra={<Button icon={<EditOutlined />} onClick={openEdit}>Изменить</Button>}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Имя">{profile?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
          <Descriptions.Item label="Телефон">{profile?.phone || 'Не указан'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Button danger icon={<LogoutOutlined />} block onClick={handleLogout} style={{ marginTop: 20 }}>
        Выйти из аккаунта
      </Button>

      {/* МОДАЛКА */}
      <Modal
        title="Редактирование профиля"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form layout="vertical" form={form} onFinish={(vals) => updateMutation.mutate(vals)}>
          <Form.Item name="fullName" label="Имя" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Телефон" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={updateMutation.isPending}>
            Сохранить
          </Button>
        </Form>
      </Modal>
    </div>
  );
};