/**
 * Custom hook for document calculations
 */

import { InvoiceItem } from '../../types/invoice';
import { QuotationItem } from '../../types/quotation';
import { DocumentMode } from './types';

export const useDocumentCalculations = (document: any, mode: DocumentMode) => {
  const calculateSubtotal = () => {
    return document.items.reduce((sum: number, item: InvoiceItem | QuotationItem) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * document.tax) / 100;
  };

  const calculateDiscount = () => {
    if (document.discountType === 'percentage') {
      return (calculateSubtotal() * document.discount) / 100;
    }
    return document.discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount() + document.shipping;
  };

  const calculateBalance = () => {
    if (mode === 'invoice' && 'amountPaid' in document) {
      return calculateTotal() - (document.amountPaid || 0);
    }
    return calculateTotal();
  };

  return {
    calculateSubtotal,
    calculateTax,
    calculateDiscount,
    calculateTotal,
    calculateBalance,
  };
};
