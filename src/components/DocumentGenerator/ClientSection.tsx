/**
 * Client section (BILL TO / QUOTE FOR)
 */

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { DocumentMode } from './types';

interface ClientSectionProps {
  mode: DocumentMode;
  document: any;
  onUpdateClientField: (field: string, value: any) => void;
  getLabel: (key: string) => string;
}

export const ClientSection: React.FC<ClientSectionProps> = ({
  mode,
  document,
  onUpdateClientField,
  getLabel,
}) => {
  const client = mode === 'invoice' ? document.billTo : document.quoteTo;

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
      '&.Mui-focused': {
        backgroundColor: '#fff',
      }
    },
    '& .MuiInputLabel-root': {
      fontWeight: 600,
      fontSize: '0.875rem',
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#1e293b', 
          fontWeight: 700, 
          mb: 2.5, 
          fontSize: { xs: '1rem', sm: '1.125rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '2px solid #cbd5e1',
          paddingBottom: 1
        }}
      >
        {getLabel('client')}
      </Typography>
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        p: 2.5, 
        borderRadius: 3, 
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Client Name"
            value={client.name}
            onChange={(e) => onUpdateClientField('name', e.target.value)}
            size="small"
            sx={fieldStyles}
          />
          <TextField
            fullWidth
            label="Address"
            value={client.address}
            onChange={(e) => onUpdateClientField('address', e.target.value)}
            multiline
            rows={2}
            size="small"
            sx={fieldStyles}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Email"
              value={client.email}
              onChange={(e) => onUpdateClientField('email', e.target.value)}
              size="small"
              sx={fieldStyles}
            />
            <TextField
              fullWidth
              label="Phone"
              value={client.phone}
              onChange={(e) => onUpdateClientField('phone', e.target.value)}
              size="small"
              sx={fieldStyles}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
