/**
 * Logo upload component with drag & drop
 */

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Image as ImageIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface LogoUploadProps {
  logo: string;
  isDragging: boolean;
  themeColor: string;
  themeLightBg: string;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  logo,
  isDragging,
  themeColor: _themeColor,
  themeLightBg: _themeLightBg,
  onLogoUpload,
  onLogoRemove,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          color: '#1a1a1a', 
          fontWeight: 700, 
          display: 'block', 
          mb: 1.5,
          fontSize: '0.875rem',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        Company Logo
      </Typography>
      {logo ? (
        <Box
          sx={{
            position: 'relative',
            border: '2px solid #e8e8e8',
            borderRadius: 3,
            p: 2.5,
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <img
            src={logo}
            alt="Company Logo"
            style={{
              maxHeight: '120px',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
          <IconButton
            size="small"
            onClick={onLogoRemove}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: 1,
              '&:hover': { backgroundColor: '#fff' },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Box
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          sx={{
            border: isDragging ? '2px solid #2563eb' : '2px dashed #cbd5e1',
            borderRadius: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
            cursor: 'pointer',
            backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
            transition: 'all 0.2s ease',
            boxShadow: isDragging ? '0 4px 6px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': {
              borderColor: '#2563eb',
              backgroundColor: '#eff6ff',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: isDragging ? '#2563eb' : '#94a3b8', mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDragging ? '#1e293b' : '#64748b', mb: 0.5, fontWeight: 600 }}>
              {isDragging ? 'Drop logo here' : 'Click or drag to upload logo'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              PNG, JPG or SVG (max. 2MB)
            </Typography>
            <input type="file" hidden accept="image/*" onChange={onLogoUpload} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
