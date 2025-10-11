/**
 * Shared types for Document Generator components
 */

export type DocumentMode = 'invoice' | 'quotation';

export const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

export const statusColors = {
  draft: '#9e9e9e',
  sent: '#2196f3',
  accepted: '#4caf50',
  rejected: '#f44336',
  expired: '#ff9800',
};

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}
