
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { PackageIcon, MapPinIcon, UserIcon } from './icons';

const SupplierDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLocalization();

    return (
        <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-secondary">{t('supplierDashboard.title')}</h1>
                <p className="text-xl text-gray-700">{t('supplierDashboard.welcome')} {user?.name}!</p>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary">Business Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Contact Name</p>
                            <p className="text-lg font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Email Address</p>
                            <p className="text-lg font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Verification Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified Supplier
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-accent">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <MapPinIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary">Presence Info</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        As a verified supplier, you are visible to farmers using the **Find Local Suppliers** tool. 
                        Ensure your physical business is listed on Google Maps for maximum reach.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                        <PackageIcon className="w-6 h-6 text-blue-500 mt-1" />
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Direct in-app product management is currently disabled as we migrate to a new marketplace hub.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
