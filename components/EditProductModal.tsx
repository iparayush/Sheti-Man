
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { UploadIcon } from './icons';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
      });
      setImagePreview(product.image);
      setImageFile(null); // Reset file on new product
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let image = product.image;
    if (imageFile) {
        image = await fileToBase64(imageFile);
    }

    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: image,
    };
    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary">{t('supplierDashboard.editProductTitle')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">{t('supplierDashboard.productName')}</label>
              <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">{t('supplierDashboard.productDescription')}</label>
              <textarea name="description" id="edit-description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">{t('supplierDashboard.productPrice')}</label>
              <input type="number" name="price" id="edit-price" value={formData.price} onChange={handleChange} min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('supplierDashboard.productImage')}</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="mt-1 w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-center text-gray-500">
                    <UploadIcon className="w-10 h-10 mx-auto text-gray-400" />
                    <p>{t('supplierDashboard.uploadPrompt')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-md hover:bg-green-700">
              {t('supplierDashboard.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
