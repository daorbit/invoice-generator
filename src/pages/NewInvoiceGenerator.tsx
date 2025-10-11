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

  // Calculation functions
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoice.tax) / 100;
  };

  const calculateDiscount = () => {
    if (invoice.discountType === 'percentage') {
      return (calculateSubtotal() * invoice.discount) / 100;
    }
    return invoice.discount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscount();
    return subtotal + tax - discount + invoice.shipping;
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
                  Invoice Generator
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

              {/* ROW 1: Logo (Left) + INVOICE Title/Details (Right) */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'flex-start' }}>
                
                {/* Logo Upload - Left Side */}
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}
                  >
                    Company Logo
                  </Typography>
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

                {/* INVOICE Title + Details - Right Side */}
                <Box sx={{ width: '300px' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      fontSize: '36px',
                      mb: 2,
                      textAlign: 'right'
                    }}
                  >
                    INVOICE
                  </Typography>
                  <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Invoice Number
                        </Typography>
                        <TextField
                          fullWidth
                          value={invoice.invoiceNumber}
                          onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                          size="small"
                          placeholder="INV-001"
                          sx={{ backgroundColor: '#fff' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Currency
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
                          <Select
                            value={invoice.currency}
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
                  </Box>
                </Box>
              </Box>

              {/* ROW 2: FROM (Left) + Invoice Dates (Right) */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'flex-start' }}>
                
                {/* FROM Section - Left */}
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: '#1976d2', 
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      display: 'block',
                      mb: 1.5
                    }}
                  >
                    FROM (YOUR COMPANY)
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={invoice.from.name}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, name: e.target.value } })}
                      size="small"
                      placeholder="Your Company Inc."
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={invoice.from.address}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, address: e.target.value } })}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="123 Business St&#10;City, State ZIP"
                    />
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={invoice.from.email}
                        onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, email: e.target.value } })}
                        size="small"
                        placeholder="contact@company.com"
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={invoice.from.phone}
                        onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, phone: e.target.value } })}
                        size="small"
                        placeholder="+1 (555) 123-4567"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Website (Optional)"
                      value={invoice.from.website}
                      onChange={(e) => setInvoice({ ...invoice, from: { ...invoice.from, website: e.target.value } })}
                      size="small"
                      placeholder="www.yourcompany.com"
                    />
                  </Stack>
                </Box>

                {/* Invoice Dates - Right */}
                <Box sx={{ width: '300px', backgroundColor: '#f8f9fa', p: 2.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Invoice Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
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
                              sx: { backgroundColor: '#fff' }
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Due Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
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
                          sx: { backgroundColor: '#fff' }
                        },
                      }}
                    />
                      </LocalizationProvider>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        PO Number (Optional)
                      </Typography>
                      <TextField
                        fullWidth
                        value={invoice.poNumber}
                        onChange={(e) => setInvoice({ ...invoice, poNumber: e.target.value })}
                        size="small"
                        placeholder="PO-12345"
                        sx={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {/* ROW 3: BILL TO Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#1976d2', 
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    display: 'block',
                    mb: 1.5
                  }}
                >
                  BILL TO
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={invoice.billTo.name}
                    onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, name: e.target.value } })}
                    size="small"
                    placeholder="Client Company"
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={invoice.billTo.address}
                    onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, address: e.target.value } })}
                    size="small"
                    multiline
                    rows={2}
                    placeholder="456 Client Ave&#10;City, State ZIP"
                  />
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={invoice.billTo.email}
                      onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, email: e.target.value } })}
                      size="small"
                      placeholder="client@company.com"
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      value={invoice.billTo.phone}
                      onChange={(e) => setInvoice({ ...invoice, billTo: { ...invoice.billTo, phone: e.target.value } })}
                      size="small"
                      placeholder="+1 (555) 987-6543"
                    />
                  </Box>
                </Stack>
              </Box>

              {/* ROW 4: LINE ITEMS Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#1976d2', 
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    display: 'block',
                    mb: 1.5
                  }}
                >
                  LINE ITEMS
                </Typography>
                {invoice.items.map((item, index) => (
                  <Box 
                    key={item.id}
                    sx={{ 
                      mb: 2,
                      p: 2,
                      backgroundColor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                        Item #{index + 1}
                      </Typography>
                      {invoice.items.length > 1 && (
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
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TextField
                          label="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          size="small"
                          sx={{ width: '100px' }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                          label="Rate"
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                          }}
                          size="small"
                          sx={{ flex: 1 }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          disabled
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                          }}
                          size="small"
                          sx={{ 
                            flex: 1,
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: '#1976d2',
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

              {/* ROW 5: TOTALS Section - Split Layout */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                
                {/* Additional Charges - Left */}
                <Box sx={{ width: '350px' }}>
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
                      value={invoice.tax}
                      onChange={(e) => setInvoice({ ...invoice, tax: parseFloat(e.target.value) || 0 })}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                          value={invoice.discountType}
                          label="Discount Type"
                          onChange={(e) =>
                            setInvoice({ ...invoice, discountType: e.target.value as 'percentage' | 'fixed' })
                          }
                        >
                          <MenuItem value="percentage">%</MenuItem>
                          <MenuItem value="fixed">{invoice.currency}</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Discount"
                        type="number"
                        value={invoice.discount}
                        onChange={(e) => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Shipping"
                      type="number"
                      value={invoice.shipping}
                      onChange={(e) => setInvoice({ ...invoice, shipping: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                      }}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    <TextField
                      fullWidth
                      label="Amount Paid"
                      type="number"
                      value={invoice.amountPaid}
                      onChange={(e) => setInvoice({ ...invoice, amountPaid: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{invoice.currency}</InputAdornment>,
                      }}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Stack>
                </Box>

                {/* Totals Summary - Right */}
                <Box 
                  sx={{ 
                    width: '350px', 
                    backgroundColor: '#f8f9fa', 
                    p: 3, 
                    borderRadius: 1, 
                    border: '2px solid #e0e0e0',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Subtotal:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.currency} {calculateSubtotal().toFixed(2)}
                      </Typography>
                    </Box>
                    {invoice.tax > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Tax ({invoice.tax}%):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.currency} {calculateTax().toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {invoice.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Discount ({invoice.discountType === 'percentage' ? `${invoice.discount}%` : invoice.currency}):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                          -{invoice.currency} {calculateDiscount().toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {invoice.shipping > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>Shipping:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.currency} {invoice.shipping.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {invoice.currency} {calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                    {invoice.amountPaid > 0 && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Amount Paid:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            {invoice.currency} {invoice.amountPaid.toFixed(2)}
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
                            {invoice.currency} {(calculateTotal() - invoice.amountPaid).toFixed(2)}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Box>
              </Box>

              {/* ROW 6: NOTES & TERMS Section */}
              <Stack spacing={2.5}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666', 
                      fontWeight: 700,
                      display: 'block',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={invoice.notes}
                    onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                    placeholder="Additional notes to the client..."
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666', 
                      fontWeight: 700,
                      display: 'block',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Terms & Conditions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={invoice.terms}
                    onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                    placeholder="Payment terms and conditions..."
                    size="small"
                  />
                </Box>
              </Stack>
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
