/**
 * Custom hook for document field update handlers
 */

import { useAppDispatch } from '../../store/hooks';
import {
  updateInvoiceField,
  updateFromField as updateInvoiceFromField,
  updateBillToField,
  updateItem as updateInvoiceItem,
  addItem as addInvoiceItem,
  deleteItem as deleteInvoiceItem,
  setLogo as setInvoiceLogo,
} from '../../store/invoiceSlice';
import {
  updateQuotationField,
  updateFromField as updateQuotationFromField,
  updateQuoteToField,
  updateQuotationItem,
  addQuotationItem,
  deleteQuotationItem,
  setQuotationLogo,
} from '../../store/quotationSlice';
import { InvoiceItem } from '../../types/invoice';
import { QuotationItem } from '../../types/quotation';
import { DocumentMode } from './types';

export const useDocumentHandlers = (mode: DocumentMode, document: any) => {
  const dispatch = useAppDispatch();

  const handleUpdateField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceField({ field: field as any, value }));
    } else {
      dispatch(updateQuotationField({ field: field as any, value }));
    }
  };

  const handleUpdateFromField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceFromField({ field: field as any, value }));
    } else {
      dispatch(updateQuotationFromField({ field: field as any, value }));
    }
  };

  const handleUpdateClientField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateBillToField({ field: field as any, value }));
    } else {
      dispatch(updateQuoteToField({ field: field as any, value }));
    }
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceItem({ id, field: field as any, value }));
    } else {
      dispatch(updateQuotationItem({ id, field: field as any, value }));
    }
  };

  const handleAddItem = () => {
    if (mode === 'invoice') {
      dispatch(addInvoiceItem());
    } else {
      dispatch(addQuotationItem());
    }
  };

  const handleDeleteItem = (id: string) => {
    if (mode === 'invoice') {
      dispatch(deleteInvoiceItem(id));
    } else {
      dispatch(deleteQuotationItem(id));
    }
  };

  const handleSetLogo = (logo: string) => {
    if (mode === 'invoice') {
      dispatch(setInvoiceLogo(logo));
    } else {
      dispatch(setQuotationLogo(logo));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem | keyof QuotationItem, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    if (field === 'quantity' || field === 'rate') {
      handleUpdateItem(id, field, numValue);
      
      const item = document.items.find((i: InvoiceItem | QuotationItem) => i.id === id);
      if (item) {
        const qty = field === 'quantity' ? numValue : item.quantity;
        const rate = field === 'rate' ? numValue : item.rate;
        handleUpdateItem(id, 'amount', qty * rate);
      }
    } else {
      handleUpdateItem(id, field, value);
    }
  };

  return {
    handleUpdateField,
    handleUpdateFromField,
    handleUpdateClientField,
    handleUpdateItem,
    handleAddItem,
    handleDeleteItem,
    handleSetLogo,
    handleItemChange,
  };
};
