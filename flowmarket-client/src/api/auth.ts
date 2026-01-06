import { api } from './instance';
import type { LoginDto, AuthResponseDto, RegisterDto } from '../types/auth.ts'; 

export const authApi = {
  // Вход
  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/Auth/login', data);
    return response.data;
  },

  // Регистрация
  register: async (data: RegisterDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/Auth/register', data);
    return response.data;
  },
  
  // Получение профиля
  getMe: async (): Promise<any> => {
    const response = await api.get('/Users/me');
    return response.data;
  }
};
