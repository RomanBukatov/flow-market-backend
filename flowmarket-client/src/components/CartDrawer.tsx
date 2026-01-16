import { Drawer, List, Button, Typography, Image, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  return (
    <Drawer 
      title={`Корзина (${items.length})`} 
      placement="right" 
      onClose={onClose} 
      open={open}
      width={400}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Typography.Title level={4}>
            Итого: {getTotalPrice()} ₽
          </Typography.Title>
          <Button type="primary" size="large" block disabled={items.length === 0} onClick={() => { onClose(); navigate('/checkout'); }}>
            Оформить заказ
          </Button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <img src="/empty-cart.png" width={150} style={{ marginBottom: 20 }} />
          <h3>Корзина пуста</h3>
          <p>Добавьте цветы, чтобы покормить пиранью!</p>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeFromCart(item.id)} 
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={item.imageUrl} width={60} style={{borderRadius: 8}} preview={false} />}
                title={item.name}
                description={
                  <Space>
                    <span>{item.price} ₽</span>
                    <span>x {item.quantity} шт.</span>
                  </Space>
                }
              />
              <div style={{ fontWeight: 'bold' }}>
                {item.price * item.quantity} ₽
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};
