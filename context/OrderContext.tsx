
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        const mappedOrders: Order[] = (data || []).map((o: any) => ({
          id: o.id,
          items: o.items,
          total: o.total,
          customerName: o.customer_name,
          shippingAddress: o.shipping_address,
          status: o.status as OrderStatus,
          orderDate: o.order_date
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newOrderDB = {
      id: `AGRI-${Date.now()}`,
      user_id: session.user.id,
      customer_name: orderData.customerName,
      shipping_address: orderData.shippingAddress,
      total: orderData.total,
      status: 'Pending',
      items: orderData.items,
      order_date: new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').insert([newOrderDB]);

    if (error) {
      console.error("Error placing order:", error);
      throw error;
    } else {
      setOrders(prev => [{
        id: newOrderDB.id,
        items: newOrderDB.items,
        total: newOrderDB.total,
        customerName: newOrderDB.customer_name,
        shippingAddress: newOrderDB.shipping_address,
        status: newOrderDB.status as OrderStatus,
        orderDate: newOrderDB.order_date
      }, ...prev]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
    } else {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
