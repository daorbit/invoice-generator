import { configureStore } from '@reduxjs/toolkit';
import invoiceReducer from './invoiceSlice';
import quotationReducer from './quotationSlice';

// Middleware to save state to localStorage
const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // Save both invoice and quotation state to localStorage after every action
  const state = store.getState();
  try {
    localStorage.setItem('invoice', JSON.stringify(state.invoice));
    localStorage.setItem('quotation', JSON.stringify(state.quotation));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    invoice: invoiceReducer,
    quotation: quotationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check (Date objects)
        ignoredActions: [
          'invoice/setInvoice', 
          'invoice/updateInvoiceField',
          'quotation/setQuotation',
          'quotation/updateQuotationField'
        ],
        // Ignore these paths in the state for serializable check
        ignoredPaths: [
          'invoice.invoiceDate', 
          'invoice.dueDate',
          'quotation.quotationDate',
          'quotation.validUntil'
        ],
      },
    }).concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
