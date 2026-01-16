import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { productsData as initialProductsData } from '../data/products';

interface ProductContextType {
  products: { [key: string]: Product[] };
  addProduct: (productData: Omit<Product, 'id' | 'supplierName'>, supplierName: string) => void;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (productId: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<{ [key: string]: Product[] }>(initialProductsData);

  // Load products from localStorage on mount
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error("Failed to parse products from localStorage", error);
      localStorage.removeItem('products');
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'supplierName'>, supplierName: string) => {
    setProducts(currentProducts => {
      const allIds = Object.values(currentProducts).flat().map((p: Product) => p.id);
      const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

      const newProduct: Product = {
        id: newId,
        ...productData,
        supplierName: supplierName,
      };

      const updatedProducts = { ...currentProducts };
      (Object.keys(updatedProducts) as (keyof typeof initialProductsData)[]).forEach(lang => {
        // For simplicity, we add the English name/desc to all languages if specific translation isn't handled
        const existingLangProducts = updatedProducts[lang] || [];
        updatedProducts[lang] = [...existingLangProducts, {
            ...newProduct,
            name: productData.name,
            description: productData.description,
        }];
      });

      return updatedProducts;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(currentProducts => {
        const updatedProducts = { ...currentProducts };
        Object.keys(updatedProducts).forEach(lang => {
            updatedProducts[lang] = updatedProducts[lang].map(p => 
                p.id === updatedProduct.id ? { 
                    ...p, // preserve properties
                    ...updatedProduct,
                    name: updatedProduct.name, 
                    description: updatedProduct.description 
                } : p
            );
        });
        return updatedProducts;
    });
  };

  const deleteProduct = (productId: number) => {
    setProducts(currentProducts => {
        const updatedProducts = { ...currentProducts };
        Object.keys(updatedProducts).forEach(lang => {
            updatedProducts[lang] = updatedProducts[lang].filter(p => p.id !== productId);
        });
        return updatedProducts;
    });
  };


  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};