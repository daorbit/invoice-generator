import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice } from '../types/invoice';
import { generateInvoiceNumber } from '../utils/invoiceUtils';

interface InvoiceContextType {
  invoice: Invoice;
  updateInvoice: (invoice: Invoice) => void;
  resetInvoice: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const getDefaultInvoice = (): Invoice => ({
  logo: undefined,
  invoiceNumber: generateInvoiceNumber(),
  invoiceDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  poNumber: '',
  from: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
  billTo: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
  items: [
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ],
  notes: '',
  terms: '',
  currency: 'USD',
  tax: 0,
  discount: 0,
  discountType: 'percentage',
  shipping: 0,
  amountPaid: 0,
});

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
    const stored = localStorage.getItem('invoice_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.invoiceDate = new Date(parsed.invoiceDate);
        parsed.dueDate = new Date(parsed.dueDate);
        return parsed;
      } catch (e) {
        return getDefaultInvoice();
      }
    }
    return getDefaultInvoice();
  });

  useEffect(() => {
    localStorage.setItem('invoice_data', JSON.stringify(invoice));
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
