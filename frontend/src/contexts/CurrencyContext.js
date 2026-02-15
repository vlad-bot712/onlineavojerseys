import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'RON';
  });

  const EUR_TO_RON = 5;

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'RON' ? 'EUR' : 'RON');
  };

  const convertPrice = (priceInRON) => {
    if (currency === 'EUR') {
      return (priceInRON / EUR_TO_RON).toFixed(2);
    }
    return priceInRON.toFixed(2);
  };

  const formatPrice = (priceInRON) => {
    const converted = convertPrice(priceInRON);
    return `${converted} ${currency}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convertPrice, formatPrice, EUR_TO_RON }}>
      {children}
    </CurrencyContext.Provider>
  );
};
