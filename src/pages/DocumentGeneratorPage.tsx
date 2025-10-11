/**
 * Refactored Document Generator Page
 * Broken down into smaller, maintainable components
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DocumentPreview } from '../components/InvoicePreview/DocumentPreview';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../context/AuthContext';
import { useInvoices } from '../hooks/useInvoices';
import { useQuotations } from '../hooks/useQuotations';

// Component imports
import { DocumentHeader } from '../components/DocumentGenerator/DocumentHeader';
import { LogoUpload } from '../components/DocumentGenerator/LogoUpload';
import { DocumentDetails } from '../components/DocumentGenerator/DocumentDetails';
import { FromSection } from '../components/DocumentGenerator/FromSection';
import { DatesSection } from '../components/DocumentGenerator/DatesSection';
import { ClientSection } from '../components/DocumentGenerator/ClientSection';
import { LineItems } from '../components/DocumentGenerator/LineItems';
import { AdditionalCharges } from '../components/DocumentGenerator/AdditionalCharges';
import { TotalsSummary } from '../components/DocumentGenerator/TotalsSummary';
import { NotesSection } from '../components/DocumentGenerator/NotesSection';

// Hook imports
import { useDocumentHandlers } from '../components/DocumentGenerator/useDocumentHandlers';
import { useDocumentCalculations } from '../components/DocumentGenerator/useDocumentCalculations';

// Type imports
import { DocumentMode, NotificationState } from '../components/DocumentGenerator/types';

interface DocumentGeneratorPageProps {
  mode: DocumentMode;
}

export const DocumentGeneratorPage: React.FC<DocumentGeneratorPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { saveInvoice, syncing: invoiceSyncing } = useInvoices();
  const { saveQuotation, syncing: quotationSyncing } = useQuotations();
  
  // Get the appropriate state based on mode
  const invoice = useAppSelector((state) => state.invoice);
  const quotation = useAppSelector((state) => state.quotation);
  const document = mode === 'invoice' ? invoice : quotation;
  
  // Local state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Determine if saving is in progress
  const isSaving = mode === 'invoice' ? invoiceSyncing : quotationSyncing;

  // Theme colors based on mode
  const themeColor = mode === 'quotation' ? '#2196f3' : '#4caf50';
  const themeLightBg = mode === 'quotation' ? '#e3f2fd' : '#e8f5e9';

  // Custom hooks
  const handlers = useDocumentHandlers(mode, document);
  const calculations = useDocumentCalculations(document, mode);

  // Logo upload handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({ open: true, message: 'File size must be less than 2MB', severity: 'error' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setNotification({ open: true, message: 'Please upload an image file', severity: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handlers.handleSetLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({ open: true, message: 'File size must be less than 2MB', severity: 'error' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setNotification({ open: true, message: 'Please upload an image file', severity: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handlers.handleSetLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF and Print handlers
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = window.document.getElementById('invoice-preview');
      
      if (!element) {
        throw new Error('Preview element not found');
      }
      
      const filename = mode === 'invoice' 
        ? `invoice-${(document as any).invoiceNumber}.pdf` 
        : `quotation-${(document as any).quotationNumber}.pdf`;
      
      const opt = {
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      setNotification({ open: true, message: 'PDF downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ open: true, message: 'Failed to generate PDF', severity: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToServer = async () => {
    if (!isAuthenticated || user?.isAnonymous) {
      setNotification({ 
        open: true, 
        message: 'Please login to save to server', 
        severity: 'error' 
      });
      return;
    }

    try {
      if (mode === 'invoice') {
        const invoiceId = (invoice as any).id;
        await saveInvoice(invoiceId);
        setNotification({ 
          open: true, 
          message: 'Invoice saved to server successfully!', 
          severity: 'success' 
        });
      } else {
        const quotationId = (quotation as any).id;
        await saveQuotation(quotationId);
        setNotification({ 
          open: true, 
          message: 'Quotation saved to server successfully!', 
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      setNotification({ 
        open: true, 
        message: `Failed to save ${mode} to server`, 
        severity: 'error' 
      });
    }
  };

  const handlePrint = () => {
    setIsPrintPreview(true);
  };

  const confirmPrint = () => {
    setIsPrintPreview(false);
    setTimeout(() => window.print(), 100);
  };

  // Get labels based on mode
  const getLabel = (key: string): string => {
    const labels: Record<string, { invoice: string; quotation: string }> = {
      title: { invoice: 'Invoice Generator', quotation: 'Quotation Generator' },
      header: { invoice: 'INVOICE', quotation: 'QUOTATION' },
      number: { invoice: 'Invoice Number', quotation: 'Quotation Number' },
      date: { invoice: 'Invoice Date', quotation: 'Quotation Date' },
      secondDate: { invoice: 'Due Date', quotation: 'Valid Until' },
      client: { invoice: 'BILL TO', quotation: 'QUOTE FOR' },
      total: { invoice: 'Total', quotation: 'Total Quote' },
    };
    return labels[key]?.[mode] || '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            {/* Header */}
            <DocumentHeader
              mode={mode}
              document={document}
              isAuthenticated={isAuthenticated}
              isAnonymous={user?.isAnonymous || false}
              isSaving={isSaving}
              isDownloading={isDownloading}
              onBack={() => navigate('/')}
              onSave={handleSaveToServer}
              onPreview={() => setIsPreviewOpen(true)}
              onDownload={handleDownloadPDF}
              onPrint={handlePrint}
              getLabel={getLabel}
            />

            {/* ROW 1: Logo + Document Header */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, 
              mb: 4, 
              alignItems: 'flex-start' 
            }}>
              <LogoUpload
                logo={document.logo || ''}
                isDragging={isDragging}
                themeColor={themeColor}
                themeLightBg={themeLightBg}
                onLogoUpload={handleLogoUpload}
                onLogoRemove={() => handlers.handleSetLogo('')}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
              <DocumentDetails
                mode={mode}
                document={document}
                themeColor={themeColor}
                onUpdateField={handlers.handleUpdateField}
                getLabel={getLabel}
              />
            </Box>

            {/* ROW 2: FROM + Dates */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, 
              mb: 4 
            }}>
              <FromSection
                from={document.from}
                onUpdateFromField={handlers.handleUpdateFromField}
              />
              <DatesSection
                mode={mode}
                document={document}
                themeColor={themeColor}
                themeLightBg={themeLightBg}
                onUpdateField={handlers.handleUpdateField}
                getLabel={getLabel}
              />
            </Box>

            {/* ROW 3: Client Info */}
            <ClientSection
              mode={mode}
              document={document}
              onUpdateClientField={handlers.handleUpdateClientField}
              getLabel={getLabel}
            />

            {/* ROW 4: LINE ITEMS */}
            <LineItems
              items={document.items}
              currency={document.currency}
              themeColor={themeColor}
              onItemChange={handlers.handleItemChange}
              onDeleteItem={handlers.handleDeleteItem}
              onAddItem={handlers.handleAddItem}
            />

            {/* ROW 5: Additional Charges + Totals Summary */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              gap: { xs: 3, md: 3 },
              mb: 4 
            }}>
              <AdditionalCharges
                mode={mode}
                document={document}
                onUpdateField={handlers.handleUpdateField}
              />
              <TotalsSummary
                mode={mode}
                document={document}
                themeColor={themeColor}
                subtotal={calculations.calculateSubtotal()}
                tax={calculations.calculateTax()}
                discount={calculations.calculateDiscount()}
                total={calculations.calculateTotal()}
                balance={calculations.calculateBalance()}
              />
            </Box>

            {/* ROW 6: Notes, Terms, and Payment Terms */}
            <NotesSection
              mode={mode}
              document={document}
              onUpdateField={handlers.handleUpdateField}
            />
          </Paper>
        </Container>

        {/* Preview Dialog */}
        <Dialog
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { minHeight: '80vh' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{mode === 'invoice' ? 'Invoice' : 'Quotation'} Preview</Typography>
            <IconButton onClick={() => setIsPreviewOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box id="invoice-preview">
              <DocumentPreview document={document} mode={mode} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Print Preview Dialog */}
        <Dialog
          open={isPrintPreview}
          onClose={() => setIsPrintPreview(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { minHeight: '80vh' } }}
        >
          <DialogTitle>Print Preview</DialogTitle>
          <DialogContent>
            <Box id="print-preview">
              <DocumentPreview document={document} mode={mode} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPrintPreview(false)}>Cancel</Button>
            <Button onClick={confirmPrint} variant="contained" startIcon={<PrintIcon />}>
              Print
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};
