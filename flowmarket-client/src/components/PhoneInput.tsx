import React from 'react';
import { Input } from 'antd';

export const PhoneInput = ({ value, onChange, placeholder, size }: any) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
   
    let numbers = input.replace(/\D/g, '');

   
    if (numbers === '7' && input.length < (value?.length || 0)) {
       onChange?.('');
       return;
    }
    
 
    if (numbers.length === 0) {
        onChange?.('');
        return;
    }
    
    
    if (numbers[0] === '8') numbers = '7' + numbers.substring(1);
    // Если первой цифры 7 нет, добавляем
    if (numbers[0] !== '7') numbers = '7' + numbers;

    // Обрезаем лишнее (макс 11 цифр: 7 999 111 22 33)
    numbers = numbers.substring(0, 11);

    // 2. Форматируем: +7 (XXX) XXX-XX-XX
    let formatted = '+7';
    if (numbers.length > 1) formatted += ' (' + numbers.substring(1, 4);
    if (numbers.length > 4) formatted += ') ' + numbers.substring(4, 7);
    if (numbers.length > 7) formatted += '-' + numbers.substring(7, 9);
    if (numbers.length > 9) formatted += '-' + numbers.substring(9, 11);

    // 3. Возвращаем родителю (Ant Form)
    onChange?.(formatted);
  };

  return (
    <Input 
      value={value} 
      onChange={handleChange}
      placeholder={placeholder || "+7 (999) 000-00-00"} 
      size={size}
      maxLength={18} // Ограничение длины строки
    />
  );
};