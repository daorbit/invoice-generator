import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quotation, QuotationItem } from '../types/quotation';
import type { BusinessDefaults } from '../types/businessProfile';

// Generate quotation number
const generateQuotationNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QUO-${year}${month}${day}-${random}`;
};

// Load initial state from localStorage
const loadQuotationFromStorage = (): Quotation | null => {
  try {
    const savedQuotation = localStorage.getItem('quotation');
    if (savedQuotation) {
      const parsed = JSON.parse(savedQuotation);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        quotationDate: parsed.quotationDate ? new Date(parsed.quotationDate) : new Date(),
        validUntil: parsed.validUntil ? new Date(parsed.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }
  } catch (error) {
    console.error('Error loading quotation from localStorage:', error);
  }
  return null;
};

const getInitialState = (): Quotation => {
  const savedQuotation = loadQuotationFromStorage();
  
  if (savedQuotation) {
    return savedQuotation;
  }

  // Default initial state
  return {
    quotationNumber: generateQuotationNumber(),
    quotationDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    from: {
      name: '',
      address: '',
      email: '',
      phone: '',
      website: '',
    },
    quoteTo: {
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
    status: 'draft',
    notes: '',
    terms: '',
    logo: '',
    referenceNumber: '',
    paymentTerms: 'Net 30 days',
  };
};

const quotationSlice = createSlice({
  name: 'quotation',
  initialState: getInitialState(),
  reducers: {
    setQuotation: (_state, action: PayloadAction<Quotation>) => {
      return action.payload;
    },
    updateQuotationField: <K extends keyof Quotation>(
      state: Quotation,
      action: PayloadAction<{ field: K; value: Quotation[K] }>
    ) => {
      const { field, value } = action.payload;
      (state as any)[field] = value;
    },
    updateFromField: (
      state,
      action: PayloadAction<{ field: keyof Quotation['from']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.from[field] = value;
    },
    updateQuoteToField: (
      state,
      action: PayloadAction<{ field: keyof Quotation['quoteTo']; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.quoteTo[field] = value;
    },
    updateQuotationItem: (
      state,
      action: PayloadAction<{ id: string; field: keyof QuotationItem; value: string | number }>
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
    addQuotationItem: (state) => {
      const newId = (Math.max(...state.items.map((item) => parseInt(item.id))) + 1).toString();
      state.items.push({
        id: newId,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      });
    },
    deleteQuotationItem: (state, action: PayloadAction<string>) => {
      if (state.items.length > 1) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      }
    },
    updateQuotationStatus: (state, action: PayloadAction<Quotation['status']>) => {
      state.status = action.payload;
    },
    resetQuotation: () => {
      // Clear localStorage first
      localStorage.removeItem('quotation');
      // Return completely fresh state
      return {
        quotationNumber: generateQuotationNumber(),
        quotationDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
        from: {
          name: '',
          address: '',
          email: '',
          phone: '',
          website: '',
        },
        quoteTo: {
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
        discountType: 'percentage' as const,
        shipping: 0,
        status: 'draft' as const,
        notes: '',
        terms: '',
        logo: '',
        referenceNumber: '',
        paymentTerms: 'Net 30 days',
      };
    },
    setQuotationLogo: (state, action: PayloadAction<string>) => {
      state.logo = action.payload;
    },
    applyQuotationBusinessDefaults: (state, action: PayloadAction<BusinessDefaults>) => {
      if (state.from.name) return;
      const { from, currency, notes, terms } = action.payload;
      state.from = { ...from };
      state.currency = currency;
      if (!state.notes && notes) state.notes = notes;
      if (!state.terms && terms) state.terms = terms;
    },
  },
});

export const {
  setQuotation,
  updateQuotationField,
  updateFromField,
  updateQuoteToField,
  updateQuotationItem,
  addQuotationItem,
  deleteQuotationItem,
  updateQuotationStatus,
  resetQuotation,
  setQuotationLogo,
  applyQuotationBusinessDefaults,
} = quotationSlice.actions;

export default quotationSlice.reducer;
