export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  shopName: string;
  shopId: string;
  imageUrl: string;
  isDailyOffer: boolean;
  composition: string;
  assemblyTimeMinutes: number;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  maxAssemblyTime?: number;
  search?: string;
  occasion?: string;
  shopId?: string;
  isDailyOffer?: boolean; // <--- ДОБАВИТЬ
}