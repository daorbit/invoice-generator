import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/invoiceUtils';

interface ProfessionalInvoicePreviewProps {
  invoice: Invoice;
}

export const ProfessionalInvoicePreview: React.FC<ProfessionalInvoicePreviewProps> = ({ invoice }) => {
  const calculations = calculateInvoiceTotals(invoice);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        {invoice.logo && (
          <Box sx={{ mb: 3 }}>
            <img src={invoice.logo} alt="Company Logo" style={{ maxHeight: '80px', maxWidth: '200px' }} />
          </Box>
        )}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#2c3e50',
            fontSize: '42px',
            letterSpacing: '-0.5px',
          }}
        >
          INVOICE
        </Typography>
      </Box>

      {/* Company Info and Invoice Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        {/* From Section */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 0.5, fontWeight: 600 }}>
            FROM
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
            {invoice.from.name}
          </Typography>
          {invoice.from.email && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.from.email}
            </Typography>
          )}
          {invoice.from.phone && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.from.phone}
            </Typography>
          )}
          {invoice.from.address && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.from.address}
            </Typography>
          )}
          {invoice.from.website && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.from.website}
            </Typography>
          )}
        </Box>

        {/* Invoice Details */}
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              Invoice Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              {invoice.invoiceNumber || '#INV-001'}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              Invoice Date
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {formatDate(invoice.invoiceDate)}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
              Due Date
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {formatDate(invoice.dueDate)}
            </Typography>
          </Box>
          {invoice.poNumber && (
            <Box>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600 }}>
                PO Number
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {invoice.poNumber}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bill To and Ship To */}
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        {/* Bill To */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 0.5, fontWeight: 600 }}>
            BILL TO
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
            {invoice.billTo.name}
          </Typography>
          {invoice.billTo.email && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.billTo.email}
            </Typography>
          )}
          {invoice.billTo.phone && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.billTo.phone}
            </Typography>
          )}
          {invoice.billTo.address && (
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              {invoice.billTo.address}
            </Typography>
          )}
        </Box>

        {/* Ship To */}
        {invoice.shipTo && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 0.5, fontWeight: 600 }}>
              SHIP TO
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
              {invoice.shipTo.name}
            </Typography>
            {invoice.shipTo.address && (
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {invoice.shipTo.address}
              </Typography>
            )}
          </Box>
        )}
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
            {invoice.items.map((item) => (
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
              {formatCurrency(calculations.subtotal)}
            </Typography>
          </Box>

          {calculations.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Discount ({invoice.discountType === 'percentage' ? `${invoice.discount}%` : 'Fixed'})
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                -{formatCurrency(calculations.discountAmount)}
              </Typography>
            </Box>
          )}

          {calculations.taxAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Tax ({invoice.tax}%)
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {formatCurrency(calculations.taxAmount)}
              </Typography>
            </Box>
          )}

          {calculations.shippingAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Shipping
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                {formatCurrency(calculations.shippingAmount)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
              {formatCurrency(calculations.total)}
            </Typography>
          </Box>

          {invoice.amountPaid > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  Amount Paid
                </Typography>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {formatCurrency(invoice.amountPaid)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  backgroundColor: '#f8f9fa',
                  px: 2,
                  mt: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Balance Due
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                  {formatCurrency(calculations.balanceDue)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms) && (
        <Box sx={{ mt: 4 }}>
          {invoice.notes && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600, mb: 1 }}>
                NOTES
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a', whiteSpace: 'pre-wrap' }}>
                {invoice.notes}
              </Typography>
            </Box>
          )}

          {invoice.terms && (
            <Box>
              <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 600, mb: 1 }}>
                TERMS & CONDITIONS
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a', whiteSpace: 'pre-wrap' }}>
                {invoice.terms}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};
