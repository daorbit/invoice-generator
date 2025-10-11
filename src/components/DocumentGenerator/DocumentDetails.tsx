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
  // themeColor,
  onUpdateField,
  getLabel,
}) => {
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ width: { xs: '100%', md: '320px' } }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 800, 
          color: '#1e293b',
          fontSize: { xs: '32px', sm: '36px', md: '42px' },
          mb: 3,
          textAlign: { xs: 'left', md: 'right' },
          letterSpacing: '-0.5px',
          textTransform: 'uppercase',
          borderBottom: '3px solid #2563eb',
          paddingBottom: 1.5,
        }}
      >
        {getLabel('header')}
      </Typography>
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        p: 2.5, 
        borderRadius: 3, 
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <Stack spacing={2}>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#475569', 
                fontWeight: 700, 
                display: 'block', 
                mb: 0.8,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              {getLabel('number')}
            </Typography>
            <TextField
              fullWidth
              value={mode === 'invoice' ? document.invoiceNumber : document.quotationNumber}
              onChange={(e) => onUpdateField(mode === 'invoice' ? 'invoiceNumber' : 'quotationNumber', e.target.value)}
              size="small"
              placeholder={mode === 'invoice' ? 'INV-001' : 'QUO-001'}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                  }
                }
              }}
            />
          </Box>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#475569', 
                fontWeight: 700, 
                display: 'block', 
                mb: 0.8,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              Currency
            </Typography>
            <FormControl fullWidth size="small" sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8fafc',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                }
              }
            }}>
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
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#475569', 
                  fontWeight: 700, 
                  display: 'block', 
                  mb: 0.8,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              >
                Status
              </Typography>
              <FormControl fullWidth size="small" sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                  }
                }
              }}>
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
