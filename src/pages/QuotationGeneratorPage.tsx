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
  InputLabel,
  InputAdornment,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QuotationItem } from '../types/quotation';
import { UserMenu } from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateQuotationField,
  updateFromField,
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

export const QuotationGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const quotation = useAppSelector((state) => state.quotation);
  
  const [isDragging, setIsDragging] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setQuotationLogo(reader.result as string));
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
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setQuotationLogo(reader.result as string));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    dispatch(addQuotationItem());
  };

  const handleDeleteItem = (id: string) => {
    dispatch(deleteQuotationItem(id));
  };

  const handleItemChange = (id: string, field: keyof QuotationItem, value: string | number) => {
    dispatch(updateQuotationItem({ id, field, value }));
  };

  // Calculation functions
  const calculateSubtotal = () => {
    return quotation.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * quotation.tax) / 100;
  };

  const calculateDiscount = () => {
    if (quotation.discountType === 'percentage') {
      return (calculateSubtotal() * quotation.discount) / 100;
    }
    return quotation.discount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscount();
    return subtotal + tax - discount + quotation.shipping;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              mb: 3, 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/')} size="small">
                  <BackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Quotation Generator
                  </Typography>
                  <Chip 
                    label={quotation.status.toUpperCase()} 
                    size="small" 
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: statusColors[quotation.status],
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Preview Quotation">
                  <IconButton size="small" color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton size="small" color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton size="small" color="primary">
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <UserMenu />
              </Box>
            </Box>

            {/* ROW 1: Logo + QUOTATION Header */}
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
                {quotation.logo ? (
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
                    }}
                  >
                    <img
                      src={quotation.logo}
                      alt="Company Logo"
                      style={{
                        maxHeight: '100px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => dispatch(setQuotationLogo(''))}
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
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: '#f0f7ff',
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
                      <ImageIcon sx={{ fontSize: 48, color: isDragging ? '#1976d2' : '#bdbdbd', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: isDragging ? '#1976d2' : '#666', mb: 0.5 }}>
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

              {/* QUOTATION Title + Details */}
              <Box sx={{ width: { xs: '100%', md: '300px' } }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#2196f3',
                    fontSize: { xs: '28px', sm: '32px', md: '36px' },
                    mb: 2,
                    textAlign: { xs: 'left', md: 'right' }
                  }}
                >
                  QUOTATION
                </Typography>
                <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Quotation Number
                      </Typography>
                      <TextField
                        fullWidth
                        value={quotation.quotationNumber}
                        onChange={(e) => dispatch(updateQuotationField({ field: 'quotationNumber', value: e.target.value }))}
                        size="small"
                        placeholder="QUO-001"
                        sx={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Currency
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
                        <Select
                          value={quotation.currency}
                          onChange={(e) => dispatch(updateQuotationField({ field: 'currency', value: e.target.value }))}
                        >
                          {currencies.map((curr) => (
                            <MenuItem key={curr} value={curr}>
                              {curr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Status
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
                        <Select
                          value={quotation.status}
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
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* ROW 2: FROM + Quotation Dates */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3, 
              mb: 4, 
              alignItems: 'flex-start' 
            }}>
              {/* FROM Section */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#1976d2', 
                    fontWeight: 700,
                    letterSpacing: 1,
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
                    value={quotation.from.name}
                    onChange={(e) => dispatch(updateFromField({ field: 'name', value: e.target.value }))}
                    size="small"
                    placeholder="Your Company Inc."
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={quotation.from.address}
                    onChange={(e) => dispatch(updateFromField({ field: 'address', value: e.target.value }))}
                    multiline
                    rows={2}
                    size="small"
                    placeholder="123 Business St&#10;City, State ZIP"
                  />
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={quotation.from.email}
                      onChange={(e) => dispatch(updateFromField({ field: 'email', value: e.target.value }))}
                      size="small"
                      placeholder="contact@company.com"
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      value={quotation.from.phone}
                      onChange={(e) => dispatch(updateFromField({ field: 'phone', value: e.target.value }))}
                      size="small"
                      placeholder="+1 (555) 123-4567"
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Website (Optional)"
                    value={quotation.from.website}
                    onChange={(e) => dispatch(updateFromField({ field: 'website', value: e.target.value }))}
                    size="small"
                    placeholder="www.yourcompany.com"
                  />
                </Stack>
              </Box>

              {/* Quotation Dates */}
              <Box sx={{ 
                width: { xs: '100%', md: '300px' }, 
                backgroundColor: '#f8f9fa', 
                p: 2.5, 
                borderRadius: 1, 
                border: '1px solid #e0e0e0' 
              }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Quotation Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={quotation.quotationDate}
                        onChange={(newValue) => {
                          if (newValue) {
                            dispatch(updateQuotationField({ field: 'quotationDate', value: newValue }));
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
                      Valid Until
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={quotation.validUntil}
                        onChange={(newValue) => {
                          if (newValue) {
                            dispatch(updateQuotationField({ field: 'validUntil', value: newValue }));
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
                      Reference Number (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      value={quotation.referenceNumber}
                      onChange={(e) => dispatch(updateQuotationField({ field: 'referenceNumber', value: e.target.value }))}
                      size="small"
                      placeholder="REF-12345"
                      sx={{ backgroundColor: '#fff' }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ROW 3: QUOTE FOR Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#1976d2', 
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: 'block',
                  mb: 1.5
                }}
              >
                QUOTE FOR (CLIENT)
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={quotation.quoteTo.name}
                  onChange={(e) => dispatch(updateQuoteToField({ field: 'name', value: e.target.value }))}
                  size="small"
                  placeholder="Client Company"
                />
                <TextField
                  fullWidth
                  label="Address"
                  value={quotation.quoteTo.address}
                  onChange={(e) => dispatch(updateQuoteToField({ field: 'address', value: e.target.value }))}
                  size="small"
                  multiline
                  rows={2}
                  placeholder="456 Client Ave&#10;City, State ZIP"
                />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={quotation.quoteTo.email}
                    onChange={(e) => dispatch(updateQuoteToField({ field: 'email', value: e.target.value }))}
                    size="small"
                    placeholder="client@company.com"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={quotation.quoteTo.phone}
                    onChange={(e) => dispatch(updateQuoteToField({ field: 'phone', value: e.target.value }))}
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
                  color: '#666', 
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: 'block',
                  mb: 2
                }}
              >
                LINE ITEMS
              </Typography>
              <Stack spacing={2}>
                {quotation.items.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
                        Item #{index + 1}
                      </Typography>
                      {quotation.items.length > 1 && (
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
                            startAdornment: <InputAdornment position="start">{quotation.currency}</InputAdornment>,
                          }}
                          size="small"
                          sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: 1 } }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                          label="Amount"
                          value={item.amount.toFixed(2)}
                          disabled
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{quotation.currency}</InputAdornment>,
                          }}
                          size="small"
                          sx={{ 
                            flex: { xs: '1 1 100%', sm: 1 },
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
              </Stack>
            </Box>

            {/* ROW 5: TOTALS Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              gap: { xs: 3, md: 3 },
              mb: 4 
            }}>
              {/* Additional Charges */}
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
                    value={quotation.tax}
                    onChange={(e) => dispatch(updateQuotationField({ field: 'tax', value: parseFloat(e.target.value) || 0 }))}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={quotation.discountType}
                        label="Discount Type"
                        onChange={(e) =>
                          dispatch(updateQuotationField({ field: 'discountType', value: e.target.value as 'percentage' | 'fixed' }))
                        }
                      >
                        <MenuItem value="percentage">%</MenuItem>
                        <MenuItem value="fixed">{quotation.currency}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Discount"
                      type="number"
                      value={quotation.discount}
                      onChange={(e) => dispatch(updateQuotationField({ field: 'discount', value: parseFloat(e.target.value) || 0 }))}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 6px)' } }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Shipping"
                    type="number"
                    value={quotation.shipping}
                    onChange={(e) => dispatch(updateQuotationField({ field: 'shipping', value: parseFloat(e.target.value) || 0 }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{quotation.currency}</InputAdornment>,
                    }}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Stack>
              </Box>

              {/* Totals Summary */}
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '350px' }, 
                  backgroundColor: '#e3f2fd', 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: 1, 
                  border: '2px solid #2196f3',
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {quotation.currency} {calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  {quotation.tax > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Tax ({quotation.tax}%):</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {quotation.currency} {calculateTax().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {quotation.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Discount ({quotation.discountType === 'percentage' ? `${quotation.discount}%` : quotation.currency}):
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        -{quotation.currency} {calculateDiscount().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {quotation.shipping > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Shipping:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {quotation.currency} {quotation.shipping.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ borderTop: '2px solid #2196f3', pt: 1.5, mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Quote:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {quotation.currency} {calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ROW 6: Notes, Terms & Payment Terms */}
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
                  value={quotation.notes}
                  onChange={(e) => dispatch(updateQuotationField({ field: 'notes', value: e.target.value }))}
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
                  value={quotation.terms}
                  onChange={(e) => dispatch(updateQuotationField({ field: 'terms', value: e.target.value }))}
                  placeholder="Quotation terms and conditions..."
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
                  Payment Terms
                </Typography>
                <TextField
                  fullWidth
                  value={quotation.paymentTerms}
                  onChange={(e) => dispatch(updateQuotationField({ field: 'paymentTerms', value: e.target.value }))}
                  placeholder="Net 30 days, 50% upfront, etc."
                  size="small"
                />
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
