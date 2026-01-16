export type Language = 'en' | 'hi' | 'mr';

export interface RecommendationFormState {
  cropName: string;
  soilPH: string;
  soilMoisture: string;
  climate: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
}

export interface CalculatorFormState {
  landSize: string;
  cropType: string;
  fertilizerType: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: any[];
}

// Added STORE and CHECKOUT members to the Page enum to support navigation
export enum Page {
  DASHBOARD,
  RECOMMENDATION,
  CROP_DOCTOR,
  CALCULATOR,
  CHATBOT,
  FARM_TASKS,
  STORE,
  CHECKOUT,
}

export interface Weather {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  recommendation: string;
  location: string;
}

export interface MapPlace {
  maps: {
    uri: string;
    title: string;
  };
}

export type Role = 'farmer';

export interface User {
  name: string;
  email: string;
  role: Role;
}

export interface Task {
  id: string;
  text: string;
  dueDate: string | null;
  isCompleted: boolean;
  userId: string;
}

// Added missing Product interface used across the store and supplier features
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  supplierName: string;
}

// Added missing CartItem interface for shopping cart functionality
export interface CartItem extends Product {
  quantity: number;
}

// Added missing OrderStatus type for tracking order lifecycle
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

// Added missing Order interface for order history and checkout
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  shippingAddress: string;
  status: OrderStatus;
  orderDate: string;
}
