/**
 * Totals summary section
 */

import React from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import { DocumentMode } from './types';

interface TotalsSummaryProps {
  mode: DocumentMode;
  document: any;
  themeColor: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  balance: number;
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({
  mode,
  document,
  themeColor,
  subtotal,
  tax,
  discount,
  total,
  balance,
}) => {
  return (
    <Box 
      sx={{ 
        width: { xs: '100%', md: '350px' }, 
        backgroundColor: '#f8f9fa', 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 1, 
        border: '2px solid #e0e0e0',
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>Subtotal:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {document.currency} {subtotal.toFixed(2)}
          </Typography>
        </Box>
        {document.tax > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>Tax ({document.tax}%):</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {document.currency} {tax.toFixed(2)}
            </Typography>
          </Box>
        )}
        {document.discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Discount ({document.discountType === 'percentage' ? `${document.discount}%` : document.currency}):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
              -{document.currency} {discount.toFixed(2)}
            </Typography>
          </Box>
        )}
        {document.shipping > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>Shipping:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {document.currency} {document.shipping.toFixed(2)}
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: themeColor }}>
            {document.currency} {total.toFixed(2)}
          </Typography>
        </Box>
        {mode === 'invoice' && 'amountPaid' in document && document.amountPaid > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>Amount Paid:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                {document.currency} {document.amountPaid.toFixed(2)}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                py: 1,
                backgroundColor: '#fff3e0',
                px: 1.5,
                borderRadius: 1,
                mt: 1
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Balance Due:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                {document.currency} {balance.toFixed(2)}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};
