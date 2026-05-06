import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface ComparisonContextType {
    compareList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareList, setCompareList] = useState<Product[]>([]);

    const addToCompare = (product: Product) => {
        if (compareList.length >= 4) {
            toast.error('You can only compare up to 4 products');
            return;
        }
        if (compareList.find((p) => p._id === product._id)) {
            toast.error('Product already in comparison list');
            return;
        }
        setCompareList([...compareList, product]);
        toast.success(`${product.name} added to compare`);
    };

    const removeFromCompare = (productId: string) => {
        setCompareList(compareList.filter((p) => p._id !== productId));
    };

    const clearCompare = () => setCompareList([]);

    return (
        <ComparisonContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
