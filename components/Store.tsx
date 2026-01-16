
import React from 'react';
import { Product } from '../types';
import { ShoppingCartIcon, UserIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { useProducts } from '../context/ProductContext';

interface StoreProps {
  addToCart: (product: Product) => void;
}

const Store: React.FC<StoreProps> = ({ addToCart }) => {
  const { language, t } = useLocalization();
  const { products: allProducts } = useProducts();
  const products = allProducts[language] || allProducts.en;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-secondary mb-8 text-center">{t('store.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-secondary">{product.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 my-1">
                <UserIcon className="w-3 h-3"/>
                <span>{t('store.supplierLabel')} {product.supplierName}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{product.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-bold text-primary text-xl">₹{product.price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(product)} 
                  className="bg-primary text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center gap-2"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>{t('store.addToCart')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;