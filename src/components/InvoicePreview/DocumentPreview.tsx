import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Chip } from '@mui/material';
import { Invoice } from '../../types/invoice';
import { Quotation } from '../../types/quotation';

interface DocumentPreviewProps {
  document: Invoice | Quotation;
  mode: 'invoice' | 'quotation';
}

const isInvoice = (doc: Invoice | Quotation): doc is Invoice => {
  return 'invoiceNumber' in doc;
};

const isQuotation = (doc: Invoice | Quotation): doc is Quotation => {
  return 'quotationNumber' in doc;
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, mode }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: document.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return document.items.reduce((sum, item) => sum + item.amount, 0);
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
    if (isInvoice(document)) {
      return calculateTotal() - (document.amountPaid || 0);
    }
    return calculateTotal();
  };

  const statusColors = {
    draft: '#9e9e9e',
    sent: '#2196f3',
    accepted: '#4caf50',
    rejected: '#f44336',
    expired: '#ff9800',
  };

  const themeColor = mode === 'quotation' ? '#2196f3' : '#4caf50';

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: '#fff',
        minHeight: '1100px',
        padding: 4,
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        '@media print': {
          boxShadow: 'none !important',
          padding: 0,
          maxWidth: '100%',
          minHeight: 'auto',
          pageBreakAfter: 'avoid',
          pageBreakInside: 'avoid',
        },
      }}
    >
      {/* Header with Logo */}
      <Box sx={{ mb: 4 }}>
        {document.logo && (
          <Box sx={{ mb: 3 }}>
            <img src={document.logo} alt="Company Logo" style={{ maxHeight: '80px', maxWidth: '200px' }} />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: themeColor,
              fontSize: '42px',
              letterSpacing: '-0.5px',
            }}
          >
            {mode === 'invoice' ? 'INVOICE' : 'QUOTATION'}
          </Typography>
          {isQuotation(document) && (
            <Chip 
              label={document.status.toUpperCase()} 
              size="small" 
              sx={{ 
                backgroundColor: statusColors[document.status],
                color: 'white',
                fontWeight: 600,
                fontSize: '12px'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Company Info and Document Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {/* From Section */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 0.5, fontWeight: 600 }}>
            FROM
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
            {document.from.name}
          </Typography>
          {document.from.email && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {document.from.email}
            </Typography>
          )}
          {document.from.phone && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {document.from.phone}
            </Typography>
          )}
          {document.from.address && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {document.from.address}
            </Typography>
          )}
          {document.from.website && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {document.from.website}
            </Typography>
          )}
        </Box>

        {/* Document Details */}
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              {mode === 'invoice' ? 'Invoice Number' : 'Quotation Number'}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              {isInvoice(document) ? document.invoiceNumber : document.quotationNumber}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              {mode === 'invoice' ? 'Invoice Date' : 'Quotation Date'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {formatDate(isInvoice(document) ? document.invoiceDate : document.quotationDate)}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              {mode === 'invoice' ? 'Due Date' : 'Valid Until'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {formatDate(isInvoice(document) ? document.dueDate : document.validUntil)}
            </Typography>
          </Box>
          {isQuotation(document) && document.referenceNumber && (
            <Box>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
                Reference Number
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {document.referenceNumber}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bill To / Quote To */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 0.5, fontWeight: 600 }}>
            {mode === 'invoice' ? 'BILL TO' : 'QUOTE FOR'}
          </Typography>
          {isInvoice(document) ? (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                {document.billTo.name}
              </Typography>
              {document.billTo.email && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.billTo.email}
                </Typography>
              )}
              {document.billTo.phone && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.billTo.phone}
                </Typography>
              )}
              {document.billTo.address && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.billTo.address}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                {document.quoteTo.name}
              </Typography>
              {document.quoteTo.email && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.quoteTo.email}
                </Typography>
              )}
              {document.quoteTo.phone && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.quoteTo.phone}
                </Typography>
              )}
              {document.quoteTo.address && (
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {document.quoteTo.address}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Items Table */}
      <TableContainer sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 700, color: '#2c3e50', py: 2 }}>Description</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50', py: 2 }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#2c3e50', py: 2 }}>
                Rate
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#2c3e50', py: 2 }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {document.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ py: 2, color: '#546e7a' }}>{item.description}</TableCell>
                <TableCell align="center" sx={{ py: 2, color: '#546e7a' }}>
                  {item.quantity}
                </TableCell>
                <TableCell align="right" sx={{ py: 2, color: '#546e7a' }}>
                  {formatCurrency(item.rate)}
                </TableCell>
                <TableCell align="right" sx={{ py: 2, color: '#2c3e50', fontWeight: 600 }}>
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals Section */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              Subtotal
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {formatCurrency(calculateSubtotal())}
            </Typography>
          </Box>

          {document.discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Discount ({document.discountType === 'percentage' ? `${document.discount}%` : document.currency})
              </Typography>
              <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                -{formatCurrency(calculateDiscount())}
              </Typography>
            </Box>
          )}

          {document.tax > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Tax ({document.tax}%)
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {formatCurrency(calculateTax())}
              </Typography>
            </Box>
          )}

          {document.shipping > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Shipping
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {formatCurrency(document.shipping)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
              {mode === 'invoice' ? 'Total' : 'Total Quote'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: themeColor }}>
              {formatCurrency(calculateTotal())}
            </Typography>
          </Box>

          {isInvoice(document) && document.amountPaid > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  Amount Paid
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  {formatCurrency(document.amountPaid)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  backgroundColor: '#fff3e0',
                  px: 2,
                  mt: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Balance Due
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                  {formatCurrency(calculateBalance())}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Notes, Terms and Payment Terms */}
      {(document.notes || document.terms || (isQuotation(document) && document.paymentTerms)) && (
        <Box sx={{ mt: 4 }}>
          {document.notes && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600, mb: 1 }}>
                NOTES
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a', whiteSpace: 'pre-wrap' }}>
                {document.notes}
              </Typography>
            </Box>
          )}

          {document.terms && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600, mb: 1 }}>
                TERMS & CONDITIONS
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a', whiteSpace: 'pre-wrap' }}>
                {document.terms}
              </Typography>
            </Box>
          )}

          {isQuotation(document) && document.paymentTerms && (
            <Box>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600, mb: 1 }}>
                PAYMENT TERMS
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a', whiteSpace: 'pre-wrap' }}>
                {document.paymentTerms}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};
