import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  ArrowBack as BackIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { InvoiceItem } from '../types/invoice';
import { QuotationItem } from '../types/quotation';
import { DocumentPreview } from '../components/InvoicePreview/DocumentPreview';
import { UserMenu } from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAuth } from '../context/AuthContext';
import { useInvoices } from '../hooks/useInvoices';
import { useQuotations } from '../hooks/useQuotations';
import {
  updateInvoiceField,
  updateFromField as updateInvoiceFromField,
  updateBillToField,
  updateItem as updateInvoiceItem,
  addItem as addInvoiceItem,
  deleteItem as deleteInvoiceItem,
  setLogo as setInvoiceLogo,
} from '../store/invoiceSlice';
import {
  updateQuotationField,
  updateFromField as updateQuotationFromField,
  updateQuoteToField,
  updateQuotationItem,
  addQuotationItem,
  deleteQuotationItem,
  setQuotationLogo,
  updateQuotationStatus,
} from '../store/quotationSlice';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

const statusColors = {
  draft: '#9e9e9e',
  sent: '#2196f3',
  accepted: '#4caf50',
  rejected: '#f44336',
  expired: '#ff9800',
};

type DocumentMode = 'invoice' | 'quotation';

interface DocumentGeneratorPageProps {
  mode: DocumentMode;
}

export const DocumentGeneratorPage: React.FC<DocumentGeneratorPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const { saveInvoice, syncing: invoiceSyncing } = useInvoices();
  const { saveQuotation, syncing: quotationSyncing } = useQuotations();
  
  // Get the appropriate state based on mode
  const invoice = useAppSelector((state) => state.invoice);
  const quotation = useAppSelector((state) => state.quotation);
  const document = mode === 'invoice' ? invoice : quotation;
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Determine if saving is in progress
  const isSaving = mode === 'invoice' ? invoiceSyncing : quotationSyncing;

  // Determine theme colors based on mode
  const themeColor = mode === 'quotation' ? '#2196f3' : '#4caf50';
  const themeLightBg = mode === 'quotation' ? '#e3f2fd' : '#e8f5e9';

  // Helper functions to dispatch actions based on mode
  const handleUpdateField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceField({ field: field as any, value }));
    } else {
      dispatch(updateQuotationField({ field: field as any, value }));
    }
  };

  const handleUpdateFromField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceFromField({ field: field as any, value }));
    } else {
      dispatch(updateQuotationFromField({ field: field as any, value }));
    }
  };

  const handleUpdateClientField = (field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateBillToField({ field: field as any, value }));
    } else {
      dispatch(updateQuoteToField({ field: field as any, value }));
    }
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    if (mode === 'invoice') {
      dispatch(updateInvoiceItem({ id, field: field as any, value }));
    } else {
      dispatch(updateQuotationItem({ id, field: field as any, value }));
    }
  };

  const handleAddItem = () => {
    if (mode === 'invoice') {
      dispatch(addInvoiceItem());
    } else {
      dispatch(addQuotationItem());
    }
  };

  const handleDeleteItem = (id: string) => {
    if (mode === 'invoice') {
      dispatch(deleteInvoiceItem(id));
    } else {
      dispatch(deleteQuotationItem(id));
    }
  };

  const handleSetLogo = (logo: string) => {
    if (mode === 'invoice') {
      dispatch(setInvoiceLogo(logo));
    } else {
      dispatch(setQuotationLogo(logo));
    }
  };

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
        handleSetLogo(reader.result as string);
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
        handleSetLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateSubtotal = () => {
    return document.items.reduce((sum: number, item: InvoiceItem | QuotationItem) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * document.tax) / 100;
  };

  const calculateDiscount = () => {
    if (document.discountType === 'percentage') {
      return (calculateSubtotal() * document.discount) / 100;
    }
    return document.discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount() + document.shipping;
  };

  const calculateBalance = () => {
    if (mode === 'invoice' && 'amountPaid' in document) {
      return calculateTotal() - (document.amountPaid || 0);
    }
    return calculateTotal();
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem | keyof QuotationItem, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    if (field === 'quantity' || field === 'rate') {
      handleUpdateItem(id, field, numValue);
      
      const item = document.items.find((i: InvoiceItem | QuotationItem) => i.id === id);
      if (item) {
        const qty = field === 'quantity' ? numValue : item.quantity;
        const rate = field === 'rate' ? numValue : item.rate;
        handleUpdateItem(id, 'amount', qty * rate);
      }
    } else {
      handleUpdateItem(id, field, value);
    }
  };

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
        // saveInvoice uses the current invoice from Redux state
        // Pass ID if updating existing, undefined if creating new
        const invoiceId = (invoice as any).id;
        await saveInvoice(invoiceId);
        setNotification({ 
          open: true, 
          message: 'Invoice saved to server successfully!', 
          severity: 'success' 
        });
      } else {
        // saveQuotation uses the current quotation from Redux state
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/')} size="small">
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
                        backgroundColor: statusColors[document.status],
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* Save to Server Button - Only for authenticated users */}
                {isAuthenticated && !user?.isAnonymous && (
                  <Tooltip title={`Save ${mode === 'invoice' ? 'Invoice' : 'Quotation'} to Server`}>
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={handleSaveToServer}
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
                  <IconButton size="small" color="primary" onClick={() => setIsPreviewOpen(true)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton size="small" color="primary" onClick={handleDownloadPDF} disabled={isDownloading}>
                    {isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton size="small" color="primary" onClick={handlePrint}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <UserMenu />
              </Box>
            </Box>

            {/* ROW 1: Logo + Document Header */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, 
              mb: 4, 
              alignItems: 'flex-start' 
            }}>
              {/* Logo Upload */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}
                >
                  Company Logo
                </Typography>
                {document.logo ? (
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
                      src={document.logo}
                      alt="Company Logo"
                      style={{
                        maxHeight: '120px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleSetLogo('')}
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
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
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
                      <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Document Title + Details */}
              <Box sx={{ width: { xs: '100%', md: '300px' } }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: themeColor,
                    fontSize: { xs: '28px', sm: '32px', md: '36px' },
                    mb: 2,
                    textAlign: { xs: 'left', md: 'right' }
                  }}
                >
                  {getLabel('header')}
                </Typography>
                <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {getLabel('number')}
                      </Typography>
                      <TextField
                        fullWidth
                        value={mode === 'invoice' ? (document as any).invoiceNumber : (document as any).quotationNumber}
                        onChange={(e) => handleUpdateField(mode === 'invoice' ? 'invoiceNumber' : 'quotationNumber', e.target.value)}
                        size="small"
                        placeholder={mode === 'invoice' ? 'INV-001' : 'QUO-001'}
                        sx={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Currency
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
                        <Select
                          value={document.currency}
                          onChange={(e) => handleUpdateField('currency', e.target.value)}
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
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Status
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
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
            </Box>

            {/* ROW 2: FROM + Dates */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, 
              mb: 4 
            }}>
              {/* FROM (Your Company) */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1rem' } }}>
                  FROM (YOUR COMPANY)
                </Typography>
                <Box sx={{  p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={document.from.name}
                      onChange={(e) => handleUpdateFromField('name', e.target.value)}
                      size="small"
                      sx={{ backgroundColor: '#fff' }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={document.from.address}
                      onChange={(e) => handleUpdateFromField('address', e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      sx={{ backgroundColor: '#fff' }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={document.from.email}
                        onChange={(e) => handleUpdateFromField('email', e.target.value)}
                        size="small"
                        sx={{ backgroundColor: '#fff' }}
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={document.from.phone}
                        onChange={(e) => handleUpdateFromField('phone', e.target.value)}
                        size="small"
                        sx={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Website (Optional)"
                      value={document.from.website || ''}
                      onChange={(e) => handleUpdateFromField('website', e.target.value)}
                      size="small"
                      sx={{ backgroundColor: '#fff' }}
                    />
                  </Stack>
                </Box>
              </Box>

              {/* Dates */}
              <Box sx={{ width: { xs: '100%', md: '300px' } }}>
                <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  &nbsp;
                </Typography>
                <Box sx={{ backgroundColor: themeLightBg, p: 2, borderRadius: 1, border: `1px solid ${themeColor}40` }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {getLabel('date')}
                      </Typography>
                      <DatePicker
                        value={mode === 'invoice' ? (document as any).invoiceDate : (document as any).quotationDate}
                        onChange={(date) => handleUpdateField(mode === 'invoice' ? 'invoiceDate' : 'quotationDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: { backgroundColor: '#fff' }
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {getLabel('secondDate')}
                      </Typography>
                      <DatePicker
                        value={mode === 'invoice' ? (document as any).dueDate : (document as any).validUntil}
                        onChange={(date) => handleUpdateField(mode === 'invoice' ? 'dueDate' : 'validUntil', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: { backgroundColor: '#fff' }
                          }
                        }}
                      />
                    </Box>
                    {mode === 'quotation' && 'referenceNumber' in document && (
                      <TextField
                        fullWidth
                        label="Reference Number (Optional)"
                        value={document.referenceNumber || ''}
                        onChange={(e) => handleUpdateField('referenceNumber', e.target.value)}
                        size="small"
                        placeholder="REF-12345"
                        sx={{ backgroundColor: '#fff' }}
                      />
                    )}
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* ROW 3: Client Info */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {getLabel('client')}
              </Typography>
              <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={mode === 'invoice' ? (document as any).billTo.name : (document as any).quoteTo.name}
                    onChange={(e) => handleUpdateClientField('name', e.target.value)}
                    size="small"
                    sx={{ backgroundColor: '#fff' }}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={mode === 'invoice' ? (document as any).billTo.address : (document as any).quoteTo.address}
                    onChange={(e) => handleUpdateClientField('address', e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    sx={{ backgroundColor: '#fff' }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={mode === 'invoice' ? (document as any).billTo.email : (document as any).quoteTo.email}
                      onChange={(e) => handleUpdateClientField('email', e.target.value)}
                      size="small"
                      sx={{ backgroundColor: '#fff' }}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      value={mode === 'invoice' ? (document as any).billTo.phone : (document as any).quoteTo.phone}
                      onChange={(e) => handleUpdateClientField('phone', e.target.value)}
                      size="small"
                      sx={{ backgroundColor: '#fff' }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ROW 4: LINE ITEMS */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: themeColor, 
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  display: 'block',
                  mb: 1.5
                }}
              >
                LINE ITEMS
              </Typography>
              {document.items.map((item: InvoiceItem | QuotationItem, index: number) => (
                <Box 
                  key={item.id}
                  sx={{ 
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                      Item #{index + 1}
                    </Typography>
                    {document.items.length > 1 && (
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Product or service description..."
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <TextField
                        label="Qty"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        size="small"
                        sx={{ width: { xs: 'calc(50% - 6px)', sm: '100px' } }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                      <TextField
                        label="Rate"
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{document.currency}</InputAdornment>,
                        }}
                        size="small"
                        sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: 1 } }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                      <TextField
                        label="Amount"
                        type="number"
                        value={item.amount}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{document.currency}</InputAdornment>,
                        }}
                        size="small"
                        sx={{ 
                          flex: { xs: '1 1 100%', sm: 1 },
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: themeColor,
                            fontWeight: 600
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddItem} 
                sx={{ 
                  py: 1,
                  borderStyle: 'dashed',
                  '&:hover': {
                    borderStyle: 'dashed'
                  }
                }}
              >
                Add Item
              </Button>
            </Box>

            {/* ROW 5: Additional Charges + Totals Summary */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              gap: { xs: 3, md: 3 },
              mb: 4 
            }}>
              {/* Additional Charges - Left */}
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
                    onChange={(e) => handleUpdateField('tax', parseFloat(e.target.value) || 0)}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={document.discountType}
                        label="Discount Type"
                        onChange={(e) => handleUpdateField('discountType', e.target.value as 'percentage' | 'fixed')}
                      >
                        <MenuItem value="percentage">%</MenuItem>
                        <MenuItem value="fixed">{document.currency}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Discount"
                      type="number"
                      value={document.discount}
                      onChange={(e) => handleUpdateField('discount', parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => handleUpdateField('shipping', parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => handleUpdateField('amountPaid', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{document.currency}</InputAdornment>,
                      }}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Totals Summary - Right */}
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '350px' }, 
                  backgroundColor: '#f8f9fa', 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: 1, 
                  border: '2px solid #e0e0e0',
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {document.currency} {calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  {document.tax > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Tax ({document.tax}%):</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {document.currency} {calculateTax().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {document.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Discount ({document.discountType === 'percentage' ? `${document.discount}%` : document.currency}):
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        -{document.currency} {calculateDiscount().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {document.shipping > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Shipping:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {document.currency} {document.shipping.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: themeColor }}>
                      {document.currency} {calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                  {mode === 'invoice' && 'amountPaid' in document && document.amountPaid > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Amount Paid:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                          {document.currency} {document.amountPaid.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 1,
                          backgroundColor: '#fff3e0',
                          px: 1.5,
                          borderRadius: 1,
                          mt: 1
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Balance Due:</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                          {document.currency} {calculateBalance().toFixed(2)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* ROW 6: Notes, Terms, and Payment Terms */}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Notes"
                value={document.notes || ''}
                onChange={(e) => handleUpdateField('notes', e.target.value)}
                multiline
                rows={3}
                placeholder="Additional notes for the client..."
                size="small"
              />
              <TextField
                fullWidth
                label="Terms & Conditions"
                value={document.terms || ''}
                onChange={(e) => handleUpdateField('terms', e.target.value)}
                multiline
                rows={3}
                placeholder="Payment terms, refund policy, etc..."
                size="small"
              />
              {mode === 'quotation' && 'paymentTerms' in document && (
                <TextField
                  fullWidth
                  label="Payment Terms"
                  value={document.paymentTerms || ''}
                  onChange={(e) => handleUpdateField('paymentTerms', e.target.value)}
                  placeholder="E.g., Net 30 days, 50% upfront..."
                  size="small"
                />
              )}
            </Stack>
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
