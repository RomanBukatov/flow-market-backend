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