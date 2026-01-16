import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './context/LocalizationContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LocalizationProvider>
      <AuthProvider>
        <ProductProvider>
          <OrderProvider>
            <TaskProvider>
              <App />
            </TaskProvider>
          </OrderProvider>
        </ProductProvider>
      </AuthProvider>
    </LocalizationProvider>
  </React.StrictMode>
);