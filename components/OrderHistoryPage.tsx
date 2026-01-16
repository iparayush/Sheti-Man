
import React from 'react';
import { useOrders } from '../context/OrderContext';
import { useLocalization } from '../context/LocalizationContext';
import { OrderStatus } from '../types';

const OrderHistoryPage: React.FC = () => {
    const { orders } = useOrders();
    const { t } = useLocalization();

    const OrderStatusPill: React.FC<{ status: OrderStatus }> = ({ status }) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        const statusClasses = {
            Pending: "bg-yellow-100 text-yellow-800",
            Shipped: "bg-blue-100 text-blue-800",
            Delivered: "bg-green-100 text-green-800",
        };
        return <span className={`${baseClasses} ${statusClasses[status]}`}>{t(`orderHistoryPage.status${status}`)}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-secondary mb-6 text-center">{t('orderHistoryPage.title')}</h2>
            
            {orders.length === 0 ? (
                <p className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md">{t('orderHistoryPage.noOrders')}</p>
            ) : (
                <div className="space-y-6">
                    {orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-3 mb-3">
                                <div>
                                    <p className="font-bold text-secondary text-lg">
                                        {t('orderHistoryPage.orderId')}: <span className="font-mono">{order.id}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('orderHistoryPage.date')}: {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-2 md:mt-0 text-left md:text-right">
                                    <p className="text-lg font-bold">
                                        {t('orderHistoryPage.total')}: <span className="text-primary">₹{order.total.toFixed(2)}</span>
                                    </p>
                                    <div className="flex items-center gap-2 justify-start md:justify-end mt-1">
                                       <span className="font-semibold text-sm">{t('orderHistoryPage.status')}:</span> <OrderStatusPill status={order.status} />
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold mb-2">{t('orderHistoryPage.items')}:</h4>
                            <div className="space-y-2">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-gray-500">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;