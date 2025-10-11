import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Description as InvoiceIcon,
  RequestQuote as QuotationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.isAnonymous || false;
  
  // Use dashboard-specific hook for stats and recent documents
  const { stats, recentDocuments, loading, error } = useDashboard();

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // No need to calculate total - it's already in the document
  // const calculateTotal = (items: any[], tax: number, discount: number, discountType: string, shipping: number) => {
  //   const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  //   const taxAmount = (subtotal * tax) / 100;
  //   const discountAmount = discountType === 'percentage' 
  //     ? (subtotal * discount) / 100 
  //     : discount;
  //   return subtotal + taxAmount - discountAmount + shipping;
  // };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      paid: 'success',
      sent: 'info',
      draft: 'default',
      overdue: 'error',
      cancelled: 'error',
      accepted: 'success',
      rejected: 'error',
      expired: 'warning',
    };
    return colors[status] || 'default';
  };

  // Get statistics from hook
  const totalInvoices = stats?.invoices.total || 0;
  const totalQuotations = stats?.quotations.total || 0;
  const pendingQuotes = stats?.quotations.pending || 0;
  const unpaidInvoices = stats?.invoices.unpaid || 0;
  const totalRevenue = stats?.revenue.total || 0;

  // Separate recent documents by type
  const invoices = recentDocuments.filter(doc => doc.type === 'invoice');
  const quotations = recentDocuments.filter(doc => doc.type === 'quotation');

  // Show guest mode message
  if (isGuest) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Guest Mode
          </Typography>
          <Typography variant="body2">
            You are currently using the app in guest mode. Your documents are saved locally in your browser.
            To access documents across devices and enable cloud features, please log in with a registered account.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Create New Document
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<InvoiceIcon />}
              onClick={() => navigate('/invoice')}
              sx={{ flex: 1 }}
            >
              New Invoice
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<QuotationIcon />}
              onClick={() => navigate('/quotation')}
              sx={{ flex: 1 }}
            >
              New Quotation
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Welcome back, {user?.username || 'User'}
        </Typography>
      </Box>

      {/* Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(5, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InvoiceIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalInvoices}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <QuotationIcon sx={{ color: '#2196f3', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Quotations
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalQuotations}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <QuotationIcon sx={{ color: '#2196f3', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Pending Quotes
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
              {pendingQuotes}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InvoiceIcon sx={{ color: '#ed6c02', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Unpaid Invoices
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
              {unpaidInvoices}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InvoiceIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatCurrency(totalRevenue)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoice')}
          sx={{ mr: 2 }}
        >
          New Invoice
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/quotation')}
        >
          New Quotation
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* Recent Invoices */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Invoices
            </Typography>
            {!invoices || invoices.length === 0 ? (
              <Alert severity="info">No invoices yet. Create your first invoice!</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Invoice #</strong></TableCell>
                      <TableCell><strong>Client</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.slice(0, 10).map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.billToName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(inv.invoiceDate || inv.createdAt)}</TableCell>
                        <TableCell>{formatCurrency(inv.total)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={inv.status} 
                            color={getStatusColor(inv.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Recent Quotations */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Quotations
            </Typography>
            {!quotations || quotations.length === 0 ? (
              <Alert severity="info">No quotations yet. Create your first quotation!</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Quote #</strong></TableCell>
                      <TableCell><strong>Client</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotations.slice(0, 10).map((quot) => (
                      <TableRow key={quot.id}>
                        <TableCell>{quot.quotationNumber}</TableCell>
                        <TableCell>{quot.quoteToName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(quot.quotationDate || quot.createdAt)}</TableCell>
                        <TableCell>{formatCurrency(quot.total)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={quot.status} 
                            color={getStatusColor(quot.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};
