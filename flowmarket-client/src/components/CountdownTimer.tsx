import { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

interface CountdownTimerProps {
  createdAt: string; // Дата создания товара
}

export const CountdownTimer = ({ createdAt }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(createdAt).getTime();
      const expiresAt = created + (24 * 60 * 60 * 1000); // +24 часа
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        return;
      }

      // Форматируем время
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000); // Тикаем каждую секунду

    return () => clearInterval(timer);
  }, [createdAt]);

  if (isExpired) return <Tag color="red">Время вышло</Tag>;

  return (
    <Tag icon={<ClockCircleOutlined />} color="red" style={{ fontWeight: 'bold' }}>
      До конца: {timeLeft}
    </Tag>
  );
};