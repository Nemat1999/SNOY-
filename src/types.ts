export type Category = string;

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}
export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: Category;
  categoryId?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  details: string[];
  featured?: boolean;
  status?: "active" | "draft" | "archived" | string;
  reviews?: Review[];
}

export interface CartItem {
  id: string; // Unique combination of product.id + size + color
  product: Product;
  selectedSize?: string;
  selectedColor?: { name: string; hex: string };
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productName: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: "Processing" | "Shipped" | "Delivered";
}

export interface DiscountCoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend?: number;
  active: boolean;
  usageCount: number;
  expiryDate: string;
}

