import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CloudUpload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Invoice, InvoiceItem } from '../types/invoice';
import { ProfessionalInvoicePreview } from '../components/InvoicePreview/ProfessionalInvoicePreview';
import { generateInvoiceNumber } from '../utils/invoiceUtils';
import { UserMenu } from '../components/UserMenu';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

export const InvoiceGeneratorPage: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    logo: undefined,
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    poNumber: '',
    from: {
      name: 'Your Company Name',
      email: 'your@email.com',
      address: 'Your Address',
      phone: '+1 (555) 123-4567',
      website: 'www.yourcompany.com',
    },
    billTo: {
      name: 'Client Name',
      email: 'client@email.com',
      address: 'Client Address',
      phone: '+1 (555) 987-6543',
      website: '',
    },
    shipTo: undefined,
    items: [
      {
        id: '1',
        description: 'Service or Product Description',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    tax: 0,
    discount: 0,
    discountType: 'percentage',
    shipping: 0,
    amountPaid: 0,
    currency: 'USD',
    notes: '',
    terms: '',
  });
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const processLogoFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({ 
        open: true, 
        message: 'Please upload an image file (PNG, JPG, SVG)', 
        severity: 'error' 
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setNotification({ 
        open: true, 
        message: 'Image size should be less than 2MB', 
        severity: 'error' 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setInvoice({ ...invoice, logo: reader.result as string });
      setNotification({ 
        open: true, 
        message: 'Logo uploaded successfully!', 
        severity: 'success' 
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processLogoFile(file);
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
      processLogoFile(file);
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice({ ...invoice, items: [...invoice.items, newItem] });
  };

  const handleDeleteItem = (id: string) => {
    setInvoice({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    });
    setInvoice({ ...invoice, items: updatedItems });
  };

  const handlePrint = () => {
    // Show print preview first
    setIsPrintPreview(true);
  };

  const handleConfirmPrint = () => {
    // Close preview and trigger print dialog
    setIsPrintPreview(false);
    
    // Small delay to let the modal close
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCancelPrint = () => {
    setIsPrintPreview(false);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.querySelector('.invoice-preview-dialog');
      if (!element) {
        setNotification({ open: true, message: 'Invoice preview not found', severity: 'error' });
        return;
      }

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0.5,
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(opt).from(element).save();
      setNotification({ open: true, message: 'PDF downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ open: true, message: 'Failed to generate PDF. Please try again.', severity: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh', 
        py: 3,
        '@media print': {
          backgroundColor: '#fff',
          py: 0,
        }
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          '@media print': {
            maxWidth: 'none',
            padding: 0,
            margin: 0,
          }
        }}
      >
        {/* Form Panel */}
        <Box 
          className="no-print"
          sx={{ 
            '@media print': {
              display: 'none !important',
            }
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
            }}
          >
              {/* Header Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Invoice Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Preview Invoice">
                    <IconButton 
                      onClick={handlePreview} 
                      size="small" 
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton 
                      onClick={handleDownload} 
                      size="small" 
                      color="primary"
                      disabled={isDownloading}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print">
                    <IconButton onClick={handlePrint} size="small" color="primary">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <UserMenu />
                </Box>
              </Box>

              {/* Logo Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ mb: 1.5, fontWeight: 600, color: '#555' }}
                >
                  Company Logo
                </Typography>
                {invoice.logo ? (
                  <Box
                    sx={{
                      position: 'relative',
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      p: 3,
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <img
                      src={invoice.logo}
                      alt="Company Logo"
                      style={{
                        maxHeight: '100px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setInvoice({ ...invoice, logo: undefined })}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: 1,
                        '&:hover': {
                          backgroundColor: '#fff',
                          color: 'error.main',
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<UploadIcon />}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      Change
                      <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                  </Box>
                ) : (
                  <Box
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                      border: isDragging ? '2px solid #1976d2' : '2px dashed #d0d0d0',
                      borderRadius: 2,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 120,
                      cursor: 'pointer',
                      backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: '#f0f7ff',
                        '& .upload-icon': {
                          color: '#1976d2',
                        },
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
                      <ImageIcon
                        className="upload-icon"
                        sx={{
                          fontSize: 48,
                          color: isDragging ? '#1976d2' : '#bdbdbd',
                          mb: 1,
                          transition: 'color 0.3s ease',
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isDragging ? '#1976d2' : '#666', 
                          mb: 0.5, 
                          fontWeight: 500,
                          transition: 'color 0.3s ease',
                        }}
                      >
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

              {/* Invoice Number and Dates */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <DatePicker
                      label="Invoice Date"
                      value={invoice.invoiceDate}
                      onChange={(newValue) => {
                        if (newValue) {
                          setInvoice({ ...invoice, invoiceDate: newValue });
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                    <DatePicker
                      label="Due Date"
                      value={invoice.dueDate}
                      onChange={(newValue) => {
                        if (newValue) {
                          setInvoice({ ...invoice, dueDate: newValue });
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="PO Number (Optional)"
                    value={invoice.poNumber}
                    onChange={(e) => setInvoice({ ...invoice, poNumber: e.target.value })}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={invoice.currency}
                      label="Currency"
                      onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                    >
                      {currencies.map((curr) => (
                        <MenuItem key={curr} value={curr}>
                          {curr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* From Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    From (Your Company)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={invoice.from.name}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, name: e.target.value } })}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={invoice.from.email}
                        onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, email: e.target.value } })}
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={invoice.from.phone}
                        onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, phone: e.target.value } })}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Address"
                      value={invoice.from.address}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, address: e.target.value } })}
                    />
                    <TextField
                      fullWidth
                      label="Website (Optional)"
                      value={invoice.from.website}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, website: e.target.value } })}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Bill To Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Bill To (Client)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={invoice.billTo.name}
                      onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, name: e.target.value } })}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={invoice.billTo.email}
                        onChange={(e) =>
                          setInvoice({ ...invoice, billTo: { ...invoice.billTo, email: e.target.value } })
                        }
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={invoice.billTo.phone}
                        onChange={(e) =>
                          setInvoice({ ...invoice, billTo: { ...invoice.billTo, phone: e.target.value } })
                        }
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Address"
                      value={invoice.billTo.address}
                      onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, address: e.target.value } })}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Divider sx={{ my: 3 }} />

              {/* Items Section */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Items
              </Typography>

              <Box sx={{ mb: 2 }}>
                {invoice.items.map((item, index) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Item {index + 1}
                      </Typography>
                      {invoice.items.length > 1 && (
                        <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          label="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Rate"
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                          }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          disabled
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                          }}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                ))}

                <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem} sx={{ py: 1.5 }}>
                  Add Item
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Financial Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Additional Charges
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Tax (%)"
                        type="number"
                        value={invoice.tax}
                        onChange={(e) => setInvoice({ ...invoice, tax: parseFloat(e.target.value) || 0 })}
                      />
                      <FormControl fullWidth>
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                          value={invoice.discountType}
                          label="Discount Type"
                          onChange={(e) =>
                            setInvoice({ ...invoice, discountType: e.target.value as 'percentage' | 'fixed' })
                          }
                        >
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="fixed">Fixed</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label={invoice.discountType === 'percentage' ? 'Discount (%)' : `Discount (${invoice.currency})`}
                        type="number"
                        value={invoice.discount}
                        onChange={(e) => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                      />
                      <TextField
                        fullWidth
                        label="Shipping"
                        type="number"
                        value={invoice.shipping}
                        onChange={(e) => setInvoice({ ...invoice, shipping: parseFloat(e.target.value) || 0 })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Amount Paid"
                      type="number"
                      value={invoice.amountPaid}
                      onChange={(e) => setInvoice({ ...invoice, amountPaid: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                      }}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Divider sx={{ my: 3 }} />

              {/* Notes and Terms */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Notes & Terms
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={invoice.notes}
                      onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                      placeholder="Additional notes to the client..."
                    />
                    <TextField
                      fullWidth
                      label="Terms & Conditions"
                      multiline
                      rows={3}
                      value={invoice.terms}
                      onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                      placeholder="Payment terms and conditions..."
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>
      </Container>

      {/* Download Loading Overlay */}
      {isDownloading && (
        <Box
          className="no-print"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: 2,
            '@media print': {
              display: 'none !important',
            }
          }}
        >
          <CircularProgress size={60} sx={{ color: '#fff' }} />
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Generating PDF...
          </Typography>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        className="no-print"
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '@media print': {
            display: 'none !important',
          }
        }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Invoice Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Invoice Preview
          </Typography>
          <IconButton onClick={handleClosePreview} size="small">
            <Typography variant="body2">✕</Typography>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Box className="invoice-preview-dialog" sx={{ maxWidth: '850px', margin: '0 auto' }}>
            <ProfessionalInvoicePreview invoice={invoice} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClosePreview} variant="outlined" color="inherit">
            Close
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="contained" 
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={isDownloading}
          >
            Download PDF
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="contained" 
            color="primary"
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog
        open={isPrintPreview}
        onClose={handleCancelPrint}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Print Preview
          </Typography>
          <IconButton onClick={handleCancelPrint} size="small">
            <Typography variant="body2">✕</Typography>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Box className="invoice-preview-dialog" sx={{ maxWidth: '850px', margin: '0 auto' }}>
            <ProfessionalInvoicePreview invoice={invoice} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCancelPrint} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPrint} 
            variant="contained" 
            color="primary"
            startIcon={<PrintIcon />}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
