import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../services/supabaseClient';

interface ProductContextType {
  products: { [key: string]: Product[] };
  loading: boolean;
  addProduct: (productData: Omit<Product, 'id' | 'supplierName'>, supplierName: string) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({ en: [], hi: [], mr: [] });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;

      const grouped: { [key: string]: Product[] } = { en: [], hi: [], mr: [] };
      (data || []).forEach((p: any) => {
        const product: Product = {
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          image: p.image_url,
          supplierName: p.supplier_name
        };
        const lang = p.language || 'en';
        if (!grouped[lang]) grouped[lang] = [];
        grouped[lang].push(product);
      });
      setProducts(grouped);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'supplierName'>, supplierName: string) => {
    const newProductDB = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image_url: productData.image,
      supplier_name: supplierName,
      language: 'en' // Default to English for now
    };

    try {
      const { error } = await supabase.from('products').insert([newProductDB]);
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          image_url: updatedProduct.image,
          supplier_name: updatedProduct.supplierName
        })
        .eq('id', updatedProduct.id);
      
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct }}>
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