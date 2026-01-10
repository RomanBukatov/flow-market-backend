export interface CreateShopDto {
  name: string;
  description: string;
  city: string;
  logoUrl?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  city: string;
  ownerId: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  assemblyTimeMinutes: number;
  color: string;
  occasion: string;
}

export interface SellerOrder {
  subOrderId: string;
  orderId: string;
  createdAt: string;
  status: string; // "New", "Paid", "Completed"
  userPhone: string;
  userAddress: string;
  totalPrice: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }[];
}

export interface UpdateShopDto {
  description?: string;
  logoUrl?: string;
  city?: string;
  latitude: number;
  longitude: number;
}