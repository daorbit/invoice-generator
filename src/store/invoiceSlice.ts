import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, InvoiceItem } from '../types/invoice';
import { generateInvoiceNumber } from '../utils/invoiceUtils';

// Load initial state from localStorage
const loadInvoiceFromStorage = (): Invoice | null => {
  try {
    const savedInvoice = localStorage.getItem('invoice');
    if (savedInvoice) {
      const parsed = JSON.parse(savedInvoice);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        invoiceDate: parsed.invoiceDate ? new Date(parsed.invoiceDate) : new Date(),
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }
  } catch (error) {
    console.error('Error loading invoice from localStorage:', error);
  }
  return null;
};

const getInitialState = (): Invoice => {
  const savedInvoice = loadInvoiceFromStorage();
  
  if (savedInvoice) {
    return savedInvoice;
  }

  // Default initial state
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    from: {
      name: '',
      address: '',
      email: '',
      phone: '',
      website: '',
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
    currency: 'USD',
    tax: 0,
    discount: 0,
    discountType: 'percentage',
    shipping: 0,
    amountPaid: 0,
    notes: '',
    terms: '',
    logo: '',
    poNumber: '',
  };
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: getInitialState(),
  reducers: {
    setInvoice: (_state, action: PayloadAction<Invoice>) => {
      return action.payload;
    },
    updateInvoiceField: <K extends keyof Invoice>(
      state: Invoice,
      action: PayloadAction<{ field: K; value: Invoice[K] }>
    ) => {
      const { field, value } = action.payload;
      (state as any)[field] = value;
    },
    updateFromField: (
      state,
      action: PayloadAction<{ field: keyof Invoice['from']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.from[field] = value;
    },
    updateBillToField: (
      state,
      action: PayloadAction<{ field: keyof Invoice['billTo']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.billTo[field] = value;
    },
    updateItem: (
      state,
      action: PayloadAction<{ id: string; field: keyof InvoiceItem; value: string | number }>
    ) => {
      const { id, field, value } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        (item as any)[field] = value;
        if (field === 'quantity' || field === 'rate') {
          item.amount = item.quantity * item.rate;
        }
      }
    },
    addItem: (state) => {
      const newId = (Math.max(...state.items.map((item) => parseInt(item.id))) + 1).toString();
      state.items.push({
        id: newId,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      });
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      if (state.items.length > 1) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      }
    },
    resetInvoice: () => {
      const freshState = getInitialState();
      // Clear localStorage
      localStorage.removeItem('invoice');
      return {
        ...freshState,
        invoiceNumber: generateInvoiceNumber(), // Generate new invoice number
      };
    },
    setLogo: (state, action: PayloadAction<string>) => {
      state.logo = action.payload;
    },
  },
});

export const {
  setInvoice,
  updateInvoiceField,
  updateFromField,
  updateBillToField,
  updateItem,
  addItem,
  deleteItem,
  resetInvoice,
  setLogo,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
