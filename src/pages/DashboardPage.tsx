import React from 'react';
import {
  Box,
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
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Description as InvoiceIcon,
  RequestQuote as QuotationIcon,
  AttachMoney as MoneyIcon,
  PendingActions as PendingIcon,
  ArrowUpward as ArrowUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from '../components/UserMenu';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, sm: 4, md: 6 }, py: 4 }}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 1,
            border: '1px solid #cfe2ff',
            bgcolor: '#e7f1ff',
            color: '#084298',
            '& .MuiAlert-icon': { color: '#084298' }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Guest Mode
          </Typography>
          <Typography variant="body2">
            You are currently using the app in guest mode. Your documents are saved locally in your browser.
            To access documents across devices and enable cloud features, please log in with a registered account.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              mt: 2,
              bgcolor: '#0d6efd',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0b5ed7', boxShadow: 'none' }
            }}
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
            Create New Document
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<InvoiceIcon />}
              onClick={() => navigate('/invoice')}
              sx={{ 
                flex: 1,
                bgcolor: '#0d6efd',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0b5ed7', boxShadow: 'none' }
              }}
            >
              New Invoice
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<QuotationIcon />}
              onClick={() => navigate('/quotation')}
              sx={{ 
                flex: 1,
                borderColor: '#dee2e6',
                color: '#495057',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: '#adb5bd',
                  bgcolor: '#f8f9fa'
                }
              }}
            >
              New Quotation
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Prepare chart data
  const revenueData = [
    { name: 'Total', value: totalRevenue, color: '#4caf50' },
    { name: 'Paid', value: stats?.revenue.paid || 0, color: '#2196f3' },
    { name: 'Pending', value: stats?.revenue.pending || 0, color: '#ff9800' },
  ];

  const invoiceStatusData = [
    { name: 'Paid', value: stats?.invoices.paid || 0, color: '#4caf50' },
    { name: 'Unpaid', value: stats?.invoices.unpaid || 0, color: '#f44336' },
  ];

  const quotationStatusData = [
    { name: 'Pending', value: stats?.quotations.pending || 0, color: '#ff9800' },
    { name: 'Accepted', value: stats?.quotations.accepted || 0, color: '#4caf50' },
    { name: 'Rejected', value: stats?.quotations.rejected || 0, color: '#f44336' },
  ];

  const activityData = [
    { name: 'Invoices', value: totalInvoices, icon: InvoiceIcon, color: '#4caf50' },
    { name: 'Quotations', value: totalQuotations, icon: QuotationIcon, color: '#2196f3' },
  ];

  return (
    <Box sx={{ width: '100%', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Professional Header */}
      <Box 
        sx={{ 
          background: '#fff',
          borderBottom: '1px solid #e9ecef',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* Logo and Title Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Logo */}
              <Box
                component="img"
                src="/favicon.png"
                alt="DA Orbit Logo"
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  objectFit: 'contain',
                }}
              />
              
              {/* Title and Subtitle */}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: '#6c757d', fontWeight: 400 }}>
                  Welcome back, {user?.username || 'User'}
                </Typography>
              </Box>
            </Box>
            
            {/* Quick Actions and Profile */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => navigate('/quotation')}
                sx={{ 
                  borderColor: '#dee2e6',
                  color: '#495057',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#adb5bd',
                    bgcolor: '#f8f9fa'
                  },
                  px: 2.5,
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                New Quotation
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => navigate('/invoice')}
                sx={{ 
                  bgcolor: '#0d6efd', 
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { 
                    bgcolor: '#0b5ed7',
                    boxShadow: 'none'
                  },
                  px: 2.5,
                }}
              >
                New Invoice
              </Button>
              
              {/* User Profile Menu */}
              <UserMenu />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, sm: 4, md: 6 }, py: 4 }}>
        {/* Error Messages */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 1,
              border: '1px solid #f5c6cb',
              bgcolor: '#f8d7da',
              color: '#721c24',
              '& .MuiAlert-icon': { color: '#721c24' }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Professional Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Revenue */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: '#e7f5ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <MoneyIcon sx={{ color: '#0d6efd', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {formatCurrency(totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUpIcon sx={{ fontSize: 14, color: '#198754' }} />
                  <Typography variant="caption" sx={{ color: '#198754', fontWeight: 600 }}>
                    12.5%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c757d' }}>
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Invoices */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: '#d1f4e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <InvoiceIcon sx={{ color: '#198754', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                      Total Invoices
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {totalInvoices}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  {stats?.invoices.paid || 0} paid · {unpaidInvoices} unpaid
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Quotations */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: '#fff3cd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <QuotationIcon sx={{ color: '#ffc107', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                      Quotations
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {totalQuotations}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  {stats?.quotations.accepted || 0} accepted · {pendingQuotes} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Actions */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: '#f8d7da',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <PendingIcon sx={{ color: '#dc3545', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                      Pending Actions
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {unpaidInvoices + pendingQuotes}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  {unpaidInvoices} invoices · {pendingQuotes} quotes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Breakdown - Bar Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5, fontSize: '1.125rem' }}>
                    Revenue Overview
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                    Total, paid, and pending revenue comparison
                  </Typography>
                </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

          {/* Invoice Status Distribution - Donut Chart */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontSize: '1.125rem' }}>
                  Invoice Status
                </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

          {/* Quotation Status Distribution - Donut Chart */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontSize: '1.125rem' }}>
                  Quotation Status
                </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={quotationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {quotationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

          {/* Activity Comparison - Bar Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card 
              sx={{ 
                height: '100%', 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 3, fontSize: '1.125rem' }}>
                  Document Activity
                </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={activityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
            {/* Recent Invoices */}
            <Card 
              sx={{ 
                mb: 4, 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.125rem' }}>
                    Recent Invoices
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ViewIcon />}
                    onClick={() => navigate('/invoice')}
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#0d6efd',
                      '&:hover': { bgcolor: 'rgba(13, 110, 253, 0.04)' }
                    }}
                  >
                    View All
                  </Button>
                </Box>
                {!invoices || invoices.length === 0 ? (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: 1,
                      border: '1px solid #cfe2ff',
                      bgcolor: '#e7f1ff',
                      color: '#084298',
                      '& .MuiAlert-icon': { color: '#084298' }
                    }}
                  >
                    No invoices yet. Create your first invoice!
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { py: 2, borderBottom: '1px solid #e9ecef' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Invoice #</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Total</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.slice(0, 10).map((inv) => (
                          <TableRow 
                            key={inv.id}
                            sx={{ 
                              '&:hover': { bgcolor: '#f8f9fa' },
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.875rem' }}>
                              {inv.invoiceNumber}
                            </TableCell>
                            <TableCell sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{inv.billToName || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                              {formatDate(inv.invoiceDate || inv.createdAt)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                              {formatCurrency(inv.total)}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={inv.status} 
                                color={getStatusColor(inv.status)} 
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: '#6c757d',
                                  '&:hover': { bgcolor: '#e9ecef', color: '#0d6efd' }
                                }}
                              >
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton 
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  color: '#6c757d',
                                  '&:hover': { bgcolor: '#e9ecef', color: '#0d6efd' }
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </CardContent>
          </Card>

            {/* Recent Quotations */}
            <Card 
              sx={{ 
                border: '1px solid #e9ecef',
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.125rem' }}>
                    Recent Quotations
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ViewIcon />}
                    onClick={() => navigate('/quotation')}
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#0d6efd',
                      '&:hover': { bgcolor: 'rgba(13, 110, 253, 0.04)' }
                    }}
                  >
                    View All
                  </Button>
                </Box>
                {!quotations || quotations.length === 0 ? (
                  <Alert 
                    severity="info"
                    sx={{ 
                      borderRadius: 1,
                      border: '1px solid #cfe2ff',
                      bgcolor: '#e7f1ff',
                      color: '#084298',
                      '& .MuiAlert-icon': { color: '#084298' }
                    }}
                  >
                    No quotations yet. Create your first quotation!
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { py: 2, borderBottom: '1px solid #e9ecef' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Quote #</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Total</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#495057', fontSize: '0.875rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotations.slice(0, 10).map((quot) => (
                          <TableRow 
                            key={quot.id}
                            sx={{ 
                              '&:hover': { bgcolor: '#f8f9fa' },
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.875rem' }}>
                              {quot.quotationNumber}
                            </TableCell>
                            <TableCell sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{quot.quoteToName || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                              {formatDate(quot.quotationDate || quot.createdAt)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                              {formatCurrency(quot.total)}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={quot.status} 
                                color={getStatusColor(quot.status)} 
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small"
                                sx={{ 
                                  color: '#6c757d',
                                  '&:hover': { bgcolor: '#e9ecef', color: '#0d6efd' }
                                }}
                              >
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton 
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  color: '#6c757d',
                                  '&:hover': { bgcolor: '#e9ecef', color: '#0d6efd' }
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </CardContent>
          </Card>
          </>
        )}
      </Box>
    </Box>
  );
};
