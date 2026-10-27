/**
 * Dates section (Invoice/Quote date, Due/Valid date, Reference)
 */

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DocumentMode } from './types';

interface DatesSectionProps {
  mode: DocumentMode;
  document: any;
  themeColor: string;
  themeLightBg: string;
  onUpdateField: (field: string, value: any) => void;
  getLabel: (key: string) => string;
}

export const DatesSection: React.FC<DatesSectionProps> = ({
  mode,
  document,
  themeColor,
  themeLightBg,
  onUpdateField,
  getLabel,
}) => {
  return (
    <Box sx={{ width: { xs: '100%', md: '300px' } }}>
      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        &nbsp;
      </Typography>
      <Box sx={{ backgroundColor: themeLightBg, p: 2, borderRadius: 1, border: `1px solid ${themeColor}40` }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
              {getLabel('date')}
            </Typography>
            <DatePicker
              value={mode === 'invoice' ? document.invoiceDate : document.quotationDate}
              onChange={(date) => onUpdateField(mode === 'invoice' ? 'invoiceDate' : 'quotationDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  sx: { backgroundColor: '#fff' }
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
              {getLabel('secondDate')}
            </Typography>
            <DatePicker
              value={mode === 'invoice' ? document.dueDate : document.validUntil}
              onChange={(date) => onUpdateField(mode === 'invoice' ? 'dueDate' : 'validUntil', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  sx: { backgroundColor: '#fff' }
                }
              }}
            />
          </Box>
          {mode === 'quotation' && 'referenceNumber' in document && (
            <TextField
              fullWidth
              label="Reference Number (Optional)"
              value={document.referenceNumber || ''}
              onChange={(e) => onUpdateField('referenceNumber', e.target.value)}
              size="small"
              placeholder="REF-12345"
              sx={{ backgroundColor: '#fff' }}
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
};
