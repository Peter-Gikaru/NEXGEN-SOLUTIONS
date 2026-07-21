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
  hoverImage?: string;
  discount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  isVerified: boolean;
  description: string;
  variant?: string;
  variants?: { id: string; name: string; priceOffset: number; stock: number }[];
  specs?: {
    condition?: string;
    warranty?: string;
    whatsInBox?: string[];
    [key: string]: any;
  };
  condition?: string;
}

export interface FilterState {
  category: string;
  brand: string[];
  minPrice: string;
  maxPrice: string;
  rating: string;
  inStockOnly: boolean;
  [key: string]: string | string[] | boolean | undefined;
}
