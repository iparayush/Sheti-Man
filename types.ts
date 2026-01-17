
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

// Added STORE, CHECKOUT, and ORDER_HISTORY to the Page enum
export enum Page {
  DASHBOARD,
  RECOMMENDATION,
  CROP_DOCTOR,
  CALCULATOR,
  CHATBOT,
  FARM_TASKS,
  STORE,
  CHECKOUT,
  ORDER_HISTORY
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
  picture?: string;
  phone?: string;
}

export interface Task {
  id: string;
  text: string;
  dueDate: string | null;
  isCompleted: boolean;
  userId: string;
}

// Added Product interface for the store
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  supplierName: string;
}

// Added CartItem interface extending Product
export interface CartItem extends Product {
  quantity: number;
}

// Added OrderStatus type
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

// Added Order interface for history and tracking
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  shippingAddress: string;
  status: OrderStatus;
  orderDate: string;
}
