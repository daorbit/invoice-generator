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

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        {getLabel('client')}
      </Typography>
      <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Client Name"
            value={client.name}
            onChange={(e) => onUpdateClientField('name', e.target.value)}
            size="small"
            sx={{ backgroundColor: '#fff' }}
          />
          <TextField
            fullWidth
            label="Address"
            value={client.address}
            onChange={(e) => onUpdateClientField('address', e.target.value)}
            multiline
            rows={2}
            size="small"
            sx={{ backgroundColor: '#fff' }}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Email"
              value={client.email}
              onChange={(e) => onUpdateClientField('email', e.target.value)}
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={client.phone}
              onChange={(e) => onUpdateClientField('phone', e.target.value)}
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
