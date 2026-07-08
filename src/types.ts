export interface Product {
  id: string;
  slug?: string;
  title: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  discount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  isVerified: boolean;
  description: string;
  variant?: string;
  variants?: { id: string; name: string; priceOffset: number; stock: number }[];
}
