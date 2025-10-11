import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice } from '../types/invoice';
import { getDefaultInvoice, saveInvoiceToLocalStorage, loadInvoiceFromLocalStorage } from '../utils/invoiceStorage';}

interface InvoiceContextType {
  invoice: Invoice;
  updateInvoice: (invoice: Invoice) => void;
  resetInvoice: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within InvoiceProvider');
  }
  return context;
};

interface InvoiceProviderProps {
  children: ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({ children }) => {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const stored = loadInvoiceFromLocalStorage();
    return stored || getDefaultInvoice();
  });

  useEffect(() => {
    saveInvoiceToLocalStorage(invoice);
  }, [invoice]);

  const updateInvoice = (newInvoice: Invoice) => {
    setInvoice(newInvoice);
  };

  const resetInvoice = () => {
    setInvoice(getDefaultInvoice());
  };

  return (
    <InvoiceContext.Provider value={{ invoice, updateInvoice, resetInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
};
