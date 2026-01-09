import { useState } from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { filesApi } from '../api/files';

interface ImageUploadProps {
  value?: string;           // Текущая ссылка (приходит из Form)
  onChange?: (url: string) => void; // Функция обновления (от Form)
}

export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);

  // Кастомная функция загрузки (перехватываем стандартное поведение AntD)
  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    
    try {
      const url = await filesApi.upload(file);
      // Сообщаем Ant Design, что всё ок
      onSuccess(url);
      // Сообщаем Форме, что ссылка изменилась
      onChange?.(url);
      message.success('Картинка загружена!');
    } catch (err) {
      console.error(err);
      onError(err);
      message.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  // Валидация перед загрузкой (Размер < 2MB, Тип JPG/PNG)
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('Можно грузить только JPG/PNG/WEBP!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Картинка должна быть меньше 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Загрузить</div>
    </div>
  );

  return (
    <Upload
      name="file"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      customRequest={customRequest} // <--- Используем наш API
      beforeUpload={beforeUpload}
    >
      {value ? (
        <img src={value} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};