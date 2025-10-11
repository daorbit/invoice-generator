/**
 * Document details (number, currency, status)
 */

import React from 'react';
import { Box, Typography, TextField, FormControl, Select, MenuItem, Stack } from '@mui/material';
import { DocumentMode, currencies } from './types';
import { useAppDispatch } from '../../store/hooks';
import { updateQuotationStatus } from '../../store/quotationSlice';

interface DocumentDetailsProps {
  mode: DocumentMode;
  document: any;
  themeColor: string;
  onUpdateField: (field: string, value: any) => void;
  getLabel: (key: string) => string;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  mode,
  document,
  themeColor,
  onUpdateField,
  getLabel,
}) => {
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ width: { xs: '100%', md: '300px' } }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          color: themeColor,
          fontSize: { xs: '28px', sm: '32px', md: '36px' },
          mb: 2,
          textAlign: { xs: 'left', md: 'right' }
        }}
      >
        {getLabel('header')}
      </Typography>
      <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
              {getLabel('number')}
            </Typography>
            <TextField
              fullWidth
              value={mode === 'invoice' ? document.invoiceNumber : document.quotationNumber}
              onChange={(e) => onUpdateField(mode === 'invoice' ? 'invoiceNumber' : 'quotationNumber', e.target.value)}
              size="small"
              placeholder={mode === 'invoice' ? 'INV-001' : 'QUO-001'}
              sx={{ backgroundColor: '#fff' }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Currency
            </Typography>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Select
                value={document.currency}
                onChange={(e) => onUpdateField('currency', e.target.value)}
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr} value={curr}>
                    {curr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {mode === 'quotation' && 'status' in document && (
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Status
              </Typography>
              <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
                <Select
                  value={document.status}
                  onChange={(e) => dispatch(updateQuotationStatus(e.target.value as any))}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
