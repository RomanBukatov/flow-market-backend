import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', background: '#f0f2f5' 
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Извините, принцесса в другом замке. Такой страницы не существует."
        extra={
          <Button type="primary" onClick={() => navigate('/catalog')}>
            Вернуться в магазин
          </Button>
        }
      />
    </div>
  );
};