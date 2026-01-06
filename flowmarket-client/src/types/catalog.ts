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
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}