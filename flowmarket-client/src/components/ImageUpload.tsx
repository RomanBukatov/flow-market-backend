import { useState, useEffect } from 'react'; // Добавил useEffect
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import ImgCrop from 'antd-img-crop';
import { filesApi } from '../api/files';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);

  // Синхронизируем внутренний стейт с пропсом (важно для редактирования!)
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    
    try {
      const url = await filesApi.upload(file);
      onSuccess(url);
      
      // Сразу обновляем и форму, и локальный вид
      onChange?.(url);
      setImageUrl(url); 
      
      message.success('Картинка загружена!');
    } catch (err) {
      console.error(err);
      onError(err);
      message.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) message.error('Только JPG/PNG/WEBP!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Картинка должна быть меньше 2MB!');
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div style={{ border: '1px dashed #d9d9d9', borderRadius: 8, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>Загрузить</div>
    </div>
  );

  return (
    <ImgCrop rotationSlider aspect={1 / 1} quality={0.8} modalTitle="Редактирование фото">
      <Upload
        name="file"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          uploadButton
        )}
      </Upload>
    </ImgCrop>
  );
};