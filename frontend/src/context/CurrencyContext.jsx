import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
    return useContext(CurrencyContext);
};
const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('selectedCurrency') || 'INR';
    });

    useEffect(() => {
        localStorage.setItem('selectedCurrency', currency);
    }, [currency]);
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const cacheKey = 'exchangeRatesCache';
                const cachedDataStr = localStorage.getItem(cacheKey);

                if (cachedDataStr) {
                    const cachedData = JSON.parse(cachedDataStr);
                    const now = new Date().getTime();
                    if (now - cachedData.timestamp < 43200000) {
                        setRates(cachedData.rates);
                        setLoading(false);
                        return;
                    }
                }

                const appId = import.meta.env.VITE_OPEN_EXCHANGE_APP_ID;
                if (!appId) {
                    console.log("Open Exchange Rates App ID is missing. Using fallback rates.");
                    setRates({ INR: 83.5, USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155 });
                    setLoading(false);
                    return;
                }

                const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
                const data = await response.json();
                if (data.rates) {
                    setRates(data.rates);
                    localStorage.setItem(cacheKey, JSON.stringify({
                        rates: data.rates,
                        timestamp: new Date().getTime()
                    }));
                } else {
                    throw new Error("Invalid response from Open Exchange Rates");
                }
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
                setRates({ INR: 83.5, USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155 });
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    const formatPrice = (priceInINR) => {
        if (priceInINR === undefined || priceInINR === null) return "0";
        const price = Number(priceInINR);

        if (currency === 'INR' || !rates['INR'] || !rates[currency]) {
            return `${CURRENCY_SYMBOLS['INR'] || '₹'}${price.toLocaleString('en-IN')}`;
        }

        const priceInUSD = price / rates['INR'];
        const priceInSelectedCurrency = priceInUSD * rates[currency];

        return `${CURRENCY_SYMBOLS[currency] || currency}${priceInSelectedCurrency.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };

    const value = {
        currency,
        setCurrency,
        formatPrice,
        loading,
        availableCurrencies: Object.keys(CURRENCY_SYMBOLS)
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};
