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
} from '@mui/icons-material';
import { UserMenu } from '../UserMenu';
import { DocumentMode, statusColors } from './types';

interface DocumentHeaderProps {
  mode: DocumentMode;
  document: any;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isSaving: boolean;
  isDownloading: boolean;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onPrint: () => void;
  getLabel: (key: string) => string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  mode,
  document,
  isAuthenticated,
  isAnonymous,
  isSaving,
  isDownloading,
  onBack,
  onSave,
  onPreview,
  onDownload,
  onPrint,
  getLabel,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} size="small">
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {getLabel('title')}
          </Typography>
          {mode === 'quotation' && 'status' in document && (
            <Chip 
              label={document.status.toUpperCase()} 
              size="small" 
              sx={{ 
                mt: 0.5,
                backgroundColor: statusColors[document.status as keyof typeof statusColors] || statusColors.draft,
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {/* Save to Server Button - Only for authenticated users */}
        {isAuthenticated && !isAnonymous && (
          <Tooltip title={`Save ${mode === 'invoice' ? 'Invoice' : 'Quotation'} to Server`}>
            <span>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={onSave}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isSaving ? 'Saving...' : 'Save to Server'}
              </Button>
            </span>
          </Tooltip>
        )}
        <Tooltip title={`Preview ${mode === 'invoice' ? 'Invoice' : 'Quotation'}`}>
          <IconButton size="small" color="primary" onClick={onPreview}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download PDF">
          <IconButton size="small" color="primary" onClick={onDownload} disabled={isDownloading}>
            {isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Print">
          <IconButton size="small" color="primary" onClick={onPrint}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <UserMenu />
      </Box>
    </Box>
  );
};
