import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface CurrencyContextType {
    currency: string;
    symbol: string;
    rates: Record<string, number>;
    setCurrency: (code: string) => void;
    convert: (amountUSD: number) => string;
    loading: boolean;
    lastUpdated: string | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$', PKR: '₨', EUR: '€', GBP: '£',
    INR: '₹', AED: 'د.إ', SAR: '﷼', CAD: 'CA$', AUD: 'A$',
};

const CURRENCY_NAMES: Record<string, string> = {
    USD: 'US Dollar', PKR: 'Pakistani Rupee', EUR: 'Euro',
    GBP: 'British Pound', INR: 'Indian Rupee', AED: 'UAE Dirham',
    SAR: 'Saudi Riyal', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
};

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'USD', symbol: '$', rates: { USD: 1 },
    setCurrency: () => {}, convert: (n) => `$${n.toFixed(2)}`,
    loading: false, lastUpdated: null,
});

export const useCurrency = () => useContext(CurrencyContext);

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState<string>(
        () => localStorage.getItem('preferredCurrency') || 'USD'
    );
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const { data } = await api.get('/currency/rates');
                setRates(data.rates || { USD: 1 });
                setLastUpdated(data.lastUpdated || null);
            } catch {
                // Keep default rates on failure
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
        // Refresh every 30 minutes
        const interval = setInterval(fetchRates, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const setCurrency = useCallback((code: string) => {
        setCurrencyState(code);
        localStorage.setItem('preferredCurrency', code);
    }, []);

    const convert = useCallback((amountUSD: number): string => {
        const rate = rates[currency] ?? 1;
        const converted = amountUSD * rate;
        const sym = CURRENCY_SYMBOLS[currency] ?? currency;
        // Format based on magnitude
        if (converted >= 1000) {
            return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
        return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, [rates, currency]);

    return (
        <CurrencyContext.Provider value={{
            currency,
            symbol: CURRENCY_SYMBOLS[currency] ?? currency,
            rates,
            setCurrency,
            convert,
            loading,
            lastUpdated,
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export { CURRENCY_SYMBOLS, CURRENCY_NAMES };
export default CurrencyContext;
