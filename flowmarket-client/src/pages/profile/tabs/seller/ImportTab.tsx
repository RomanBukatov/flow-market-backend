import { useState } from 'react';
import { Card, Upload, Button, Input, Divider, message, Result } from 'antd';
import { InboxOutlined, CloudDownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../../../api/shop';

const { Dragger } = Upload;

export const ImportTab = () => {
  const queryClient = useQueryClient();
  const [ymlUrl, setYmlUrl] = useState('');

  // Получаем ID магазина
  const { data: shop } = useQuery({ queryKey: ['my-shop'], queryFn: shopApi.getMyShop });

  // Мутация Excel
  const excelMutation = useMutation({
    mutationFn: (file: File) => shopApi.importExcel(file, shop!.id),
    onSuccess: (data) => {
      message.success(data.message || 'Excel загружен успешно!');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: () => message.error('Ошибка загрузки Excel'),
  });

  // Мутация YML
  const ymlMutation = useMutation({
    mutationFn: () => shopApi.importYml(ymlUrl, shop!.id),
    onSuccess: (data) => {
      message.success(data.message || 'YML обработан!');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      setYmlUrl('');
    },
    onError: () => message.error('Ошибка импорта YML'),
  });

  if (!shop) return <Result status="warning" title="Сначала создайте магазин" />;

  const handleExcelUpload = (options: any) => {
    excelMutation.mutate(options.file);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      
      {/* БЛОК 1: EXCEL */}
      <Card className="static-card" title={<span><FileExcelOutlined style={{color: 'green'}}/> Загрузка Excel</span>}>
        <div style={{ marginBottom: 15 }}>
            Скачайте
            <a
              href="/import_template.xlsx"
              download="MarioFlowers_Template.xlsx"
              style={{ fontWeight: 'bold', marginLeft: 5 }}
            >
              шаблон файла
            </a>
            . Колонки: Название | Цена | Описание | СсылкаФото | Цвет | Повод.
        </div>
        <Dragger 
            customRequest={handleExcelUpload} 
            showUploadList={false}
            disabled={excelMutation.isPending}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: excelMutation.isPending ? '#ccc' : '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Нажмите или перетащите файл .xlsx сюда</p>
          <p className="ant-upload-hint">
            Поддерживается массовая загрузка и обновление цен.
          </p>
        </Dragger>
      </Card>

      <Divider>ИЛИ</Divider>

      {/* БЛОК 2: YML */}
      <Card className="static-card" title={<span><CloudDownloadOutlined style={{color: 'blue'}}/> Импорт YML (Yandex)</span>}>
        <div style={{ marginBottom: 15 }}>
            Вставьте ссылку на ваш YML-фид. Мы автоматически скачаем товары и картинки.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
            <Input 
                placeholder="https://myshop.ru/price.yml" 
                value={ymlUrl}
                onChange={(e) => setYmlUrl(e.target.value)}
                size="large"
            />
            <Button 
                type="primary" 
                size="large" 
                onClick={() => ymlMutation.mutate()}
                loading={ymlMutation.isPending}
                disabled={!ymlUrl}
            >
                Загрузить
            </Button>
        </div>
      </Card>
    </div>
  );
};