import { Typography, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title} = Typography;

export const LegalPage = ({ title, content }: { title: string, content: string }) => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>Назад</Button>
      <Card className="static-card" style={{ marginTop: 20 }}>
        <Title level={2}>{title}</Title>
        <div style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{content}</div>
      </Card>
    </div>
  );
};

export const LegalPageWrapper = () => {
  const { type } = useParams<{ type: string }>();
  
  const getLegalContent = (type: string) => {
    switch (type) {
      case 'agency-agreement':
        return { 
          title: 'Агентский договор', 
          content: `1. ПРЕДМЕТ ДОГОВОРА
Исполнитель (MarioFlowers) обязуется по поручению Заказчика (Магазина) за вознаграждение совершать от своего имени, но за счет Заказчика сделки по продаже товаров Заказчика через платформу marioflowers.ru.

2. ПОРЯДОК РАСЧЕТОВ
2.1. Вознаграждение Исполнителя составляет 20% от суммы каждой транзакции.
2.2. Денежные средства, поступившие от Покупателей, перечисляются Заказчику за вычетом вознаграждения Исполнителя в течение 3-х банковских дней.

3. ПРАВА И ОБЯЗАННОСТИ
Заказчик гарантирует свежесть и качество поставляемого товара. Исполнитель обеспечивает техническое функционирование платформы и прием платежей.` 
        };
      case 'loyalty-terms':
        return { 
          title: 'Условия лояльности', 
          content: `1. ОБЩИЕ ПОЛОЖЕНИЯ
Настоящая Программа лояльности позволяет Покупателям накапливать бонусные баллы за совершенные покупки.

2. НАЧИСЛЕНИЕ БОНУСОВ
2.1. За каждый оплаченный и доставленный заказ Покупателю начисляется кэшбэк в размере 5% от суммы заказа.
2.2. 1 бонус = 1 рубль. Бонусы начисляются автоматически после смены статуса заказа на "Выполнен".

3. ИСПОЛЬЗОВАНИЕ БОНУСОВ
На текущем этапе бонусы накапливаются на личном счету пользователя и могут быть использованы для оплаты будущих покупок (в разработке).` 
        };
      default:
        return { title: 'Документ не найден', content: 'Запрашиваемый документ не существует.' };
    }
  };
  
  const { title, content } = getLegalContent(type || '');
  return <LegalPage title={title} content={content} />;
};