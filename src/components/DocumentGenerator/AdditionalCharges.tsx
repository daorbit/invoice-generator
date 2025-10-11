/**
 * Additional charges section (Tax, Discount, Shipping, Amount Paid)
 */

import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, Stack } from '@mui/material';
import { DocumentMode } from './types';

interface AdditionalChargesProps {
  mode: DocumentMode;
  document: any;
  onUpdateField: (field: string, value: any) => void;
}

export const AdditionalCharges: React.FC<AdditionalChargesProps> = ({
  mode,
  document,
  onUpdateField,
}) => {
  return (
    <Box sx={{ width: { xs: '100%', md: '350px' } }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#666', 
          fontWeight: 700,
          display: 'block',
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        Additional Charges
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          fullWidth
          label="Tax (%)"
          type="number"
          value={document.tax}
          onChange={(e) => onUpdateField('tax', parseFloat(e.target.value) || 0)}
          size="small"
          inputProps={{ min: 0, step: 0.01 }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
            <InputLabel>Discount Type</InputLabel>
            <Select
              value={document.discountType}
              label="Discount Type"
              onChange={(e) => onUpdateField('discountType', e.target.value as 'percentage' | 'fixed')}
            >
              <MenuItem value="percentage">%</MenuItem>
              <MenuItem value="fixed">{document.currency}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Discount"
            type="number"
            value={document.discount}
            onChange={(e) => onUpdateField('discount', parseFloat(e.target.value) || 0)}
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}
          />
        </Box>
        <TextField
          fullWidth
          label="Shipping"
          type="number"
          value={document.shipping}
          onChange={(e) => onUpdateField('shipping', parseFloat(e.target.value) || 0)}
          InputProps={{
            startAdornment: <InputAdornment position="start">{document.currency}</InputAdornment>,
          }}
          size="small"
          inputProps={{ min: 0, step: 0.01 }}
        />
        {mode === 'invoice' && 'amountPaid' in document && (
          <TextField
            fullWidth
            label="Amount Paid"
            type="number"
            value={document.amountPaid || 0}
            onChange={(e) => onUpdateField('amountPaid', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: <InputAdornment position="start">{document.currency}</InputAdornment>,
            }}
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
          />
        )}
      </Stack>
    </Box>
  );
};
