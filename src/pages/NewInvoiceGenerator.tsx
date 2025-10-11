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
} from '@mui/icons-material';
import { Invoice, InvoiceItem } from '../types/invoice';
import { ProfessionalInvoicePreview } from '../components/InvoicePreview/ProfessionalInvoicePreview';
import { generateInvoiceNumber } from '../utils/invoiceUtils';

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
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice({ ...invoice, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.querySelector('.invoice-preview-printable');
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
        maxWidth="xl"
        sx={{
          '@media print': {
            maxWidth: 'none',
            padding: 0,
            margin: 0,
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3, 
            flexDirection: { xs: 'column', lg: 'row' },
            '@media print': {
              flexDirection: 'row',
              gap: 0,
            }
          }}
        >
          {/* Left Panel - Form */}
          <Box 
            className="no-print"
            sx={{ 
              flex: { lg: '0 0 42%' },
              '@media print': {
                display: 'none !important',
              }
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                position: { lg: 'sticky' },
                top: 20,
                maxHeight: { lg: 'calc(100vh - 40px)' },
                overflowY: 'auto',
              }}
            >
              {/* Header Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Invoice Details
                </Typography>
                <Box>
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
                </Box>
              </Box>

              {/* Logo Upload */}
              <Box sx={{ mb: 3 }}>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ py: 1.5 }}>
                  {invoice.logo ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </Button>
                {invoice.logo && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img src={invoice.logo} alt="Logo" style={{ maxHeight: '60px' }} />
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Invoice Date"
                    type="date"
                    value={invoice.invoiceDate.toISOString().split('T')[0]}
                    onChange={(e) => setInvoice({ ...invoice, invoiceDate: new Date(e.target.value) })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={invoice.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: new Date(e.target.value) })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
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

          {/* Right Panel - Live Preview */}
          <Box 
            sx={{ 
              flex: 1,
              '@media print': {
                flex: 'none',
                width: '100%',
                maxWidth: '100%',
              }
            }}
          >
            <Box 
              className="invoice-preview-printable"
              sx={{
                '@media print': {
                  boxShadow: 'none !important',
                  '& .MuiPaper-root': {
                    boxShadow: 'none !important',
                  }
                }
              }}
            >
              <ProfessionalInvoicePreview invoice={invoice} />
            </Box>
          </Box>
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
          <Box sx={{ maxWidth: '850px', margin: '0 auto' }}>
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
