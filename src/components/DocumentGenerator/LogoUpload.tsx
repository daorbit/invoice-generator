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
  themeColor,
  themeLightBg,
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
        variant="caption" 
        sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}
      >
        Company Logo
      </Typography>
      {logo ? (
        <Box
          sx={{
            position: 'relative',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            p: 2,
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
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
            border: isDragging ? `2px solid ${themeColor}` : '2px dashed #d0d0d0',
            borderRadius: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
            cursor: 'pointer',
            backgroundColor: isDragging ? themeLightBg : '#fafafa',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: themeColor,
              backgroundColor: themeLightBg,
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
            <ImageIcon sx={{ fontSize: 48, color: isDragging ? themeColor : '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDragging ? themeColor : '#666', mb: 0.5 }}>
              {isDragging ? 'Drop logo here' : 'Click or drag to upload logo'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              PNG, JPG or SVG (max. 2MB)
            </Typography>
            <input type="file" hidden accept="image/*" onChange={onLogoUpload} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
