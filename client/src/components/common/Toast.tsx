import React, { createContext, useContext, useState, ReactNode } from 'react';
import styles from './Toast.module.css';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && toast.visible && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className={styles.closeBtn}>&times;</button>
                </div>
            )}
        </ToastContext.Provider>
    );
};
