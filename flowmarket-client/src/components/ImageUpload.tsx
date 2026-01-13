import { useState } from 'react';
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

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    
    try {
      const url = await filesApi.upload(file);
      onSuccess(url);
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
    <ImgCrop 
      rotationSlider 
      aspect={1 / 1}
      quality={0.8}
      modalTitle="Редактирование фото"
      modalOk="Сохранить"
      modalCancel="Отмена"
    >
      <Upload
        name="file"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
      >
        {value ? (
          <img 
             src={value} 
             alt="uploaded" 
             style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </ImgCrop>
  );
};