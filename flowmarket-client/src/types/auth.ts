export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  fullName: string;
  phoneNumber: string;
  role: number; // 0=Admin, 1=Seller, 2=Buyer
}

export interface AuthResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
}
