/**
 * Document header with navigation and action buttons
 */

import React from 'react';
import { Box, IconButton, Typography, Button, Tooltip, CircularProgress, Chip } from '@mui/material';
import {
  ArrowBack as BackIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { DocumentMode, statusColors } from './types';

interface DocumentHeaderProps {
  mode: DocumentMode;
  document: any;
  isSaving: boolean;
  isDownloading: boolean;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onReset: () => void;
  getLabel: (key: string) => string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  mode,
  document,
  isSaving,
  isDownloading,
  onBack,
  onSave,
  onPreview,
  onDownload,
  onPrint,
  onReset,
  getLabel,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      py: 1,
      px: { xs: 3, sm: 4 },
      flexWrap: 'wrap', 
      gap: 2 
    }}>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <IconButton 
          onClick={onBack} 
          size="small"
          sx={{ 
            color: '#2563eb',
            backgroundColor: '#dbeafe',
            border: '1px solid #e2e8f0',
            '&:hover': { 
              bgcolor: '#2563eb', 
              color: '#fff',
              borderColor: '#2563eb'
            }
          }}
        >
          <BackIcon />
        </IconButton>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1e293b', 
              fontSize: { xs: '1.25rem', sm: '16px' },
              letterSpacing: '-0.5px'
            }}>
              {getLabel('title')}
            </Typography>
            {mode === 'quotation' && 'status' in document && (
              <Chip 
                label={document.status.toUpperCase()} 
                size="small" 
                sx={{ 
                  backgroundColor: statusColors[document.status as keyof typeof statusColors] || statusColors.draft,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '10px',
                  height: 22,
                  letterSpacing: '0.5px',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Right Side - Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
            size="medium"
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700,
              fontSize: '0.875rem',
              bgcolor: '#10b981',
              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.4)',
              px: 3,
              py: 1,
              '&:hover': { 
                bgcolor: '#059669', 
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.4)' 
              },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        
        <Tooltip title="Reset Form">
          <IconButton 
            size="small" 
            onClick={onReset}
            sx={{ 
              color: '#dc2626',
              backgroundColor: '#fecaca',
              border: '1px solid #e2e8f0',
              '&:hover': { 
                bgcolor: '#dc2626', 
                color: '#fff',
                borderColor: '#dc2626'
              }
            }}
          >
            <ResetIcon />
          </IconButton>
        </Tooltip>
        
        {/* Preview Button - Always visible */}
        <Tooltip title="Preview">
          <IconButton 
            size="small" 
            onClick={onPreview}
            sx={{ 
              color: '#2563eb',
              backgroundColor: '#dbeafe',
              border: '1px solid #e2e8f0',
              '&:hover': { 
                bgcolor: '#2563eb', 
                color: '#fff',
                borderColor: '#2563eb'
              }
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Download PDF">
          <IconButton 
            size="small" 
            onClick={onDownload} 
            disabled={isDownloading}
            sx={{ 
              color: '#2563eb',
              backgroundColor: '#dbeafe',
              border: '1px solid #e2e8f0',
              '&:hover': { 
                bgcolor: '#2563eb', 
                color: '#fff',
                borderColor: '#2563eb'
              },
              '&.Mui-disabled': {
                backgroundColor: '#f1f5f9',
                borderColor: '#e2e8f0',
              }
            }}
          >
            {isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Print">
          <IconButton 
            size="small" 
            onClick={onPrint}
            sx={{ 
              color: '#2563eb',
              backgroundColor: '#dbeafe',
              border: '1px solid #e2e8f0',
              '&:hover': { 
                bgcolor: '#2563eb', 
                color: '#fff',
                borderColor: '#2563eb'
              }
            }}
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
