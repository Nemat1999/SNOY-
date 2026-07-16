export type Category = "All" | "Men's Clothing" | "Women's Clothing" | "Home Decor";

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  details: string[];
  featured?: boolean;
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
