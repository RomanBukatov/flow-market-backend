import { Card, Descriptions, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../../api/user';

export const SettingsTab = ({ profile }: { profile: UserProfile | undefined }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mario-cart-storage');
    navigate('/login');
  };

  return (
    <div>
      <Card title="Мои данные" style={{ marginBottom: 20 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Имя">{profile?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
          <Descriptions.Item label="Телефон">{profile?.phone || 'Не указан'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Button danger icon={<LogoutOutlined />} block onClick={handleLogout}>
        Выйти из аккаунта
      </Button>
    </div>
  );
};