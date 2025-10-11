/**
 * FROM section (Your Company details)
 */

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';

interface FromSectionProps {
  from: any;
  onUpdateFromField: (field: string, value: any) => void;
}

export const FromSection: React.FC<FromSectionProps> = ({ from, onUpdateFromField }) => {
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
    <Box sx={{ flex: 1 }}>
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
        From (Your Company)
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
            label="Company Name"
            value={from.name}
            onChange={(e) => onUpdateFromField('name', e.target.value)}
            size="small"
            sx={fieldStyles}
          />
          <TextField
            fullWidth
            label="Address"
            value={from.address}
            onChange={(e) => onUpdateFromField('address', e.target.value)}
            multiline
            rows={2}
            size="small"
            sx={fieldStyles}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Email"
              value={from.email}
              onChange={(e) => onUpdateFromField('email', e.target.value)}
              size="small"
              sx={fieldStyles}
            />
            <TextField
              fullWidth
              label="Phone"
              value={from.phone}
              onChange={(e) => onUpdateFromField('phone', e.target.value)}
              size="small"
              sx={fieldStyles}
            />
          </Box>
          <TextField
            fullWidth
            label="Website (Optional)"
            value={from.website || ''}
            onChange={(e) => onUpdateFromField('website', e.target.value)}
            size="small"
            sx={fieldStyles}
          />
        </Stack>
      </Box>
    </Box>
  );
};
