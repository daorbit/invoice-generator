import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
} from '@mui/material';
import {
  Description as InvoiceIcon,
  RequestQuote as QuotationIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { UserMenu } from '../components/UserMenu';

export const DocumentSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const documentTypes = [
    {
      id: 'quotation',
      title: 'Quotation',
      description: 'Create a professional quotation for your clients. Perfect for sending price estimates and proposals.',
      icon: <QuotationIcon sx={{ fontSize: 80, color: '#2196f3' }} />,
      features: [
        'Price estimates',
        'Validity period',
        'Status tracking',
        'Convert to invoice',
      ],
      path: '/quotation',
      color: '#2196f3',
    },
    {
      id: 'invoice',
      title: 'Invoice',
      description: 'Generate a detailed invoice for completed work. Include payment terms, due dates, and tracking.',
      icon: <InvoiceIcon sx={{ fontSize: 80, color: '#4caf50' }} />,
      features: [
        'Payment tracking',
        'Due date management',
        'Tax calculations',
        'Professional format',
      ],
      path: '/invoice',
      color: '#4caf50',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', p: 4 }}>
      <Box>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
              Document Generator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose the type of document you want to create
            </Typography>
          </Box>
          <UserMenu />
        </Paper>

        {/* Document Type Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {documentTypes.map((doc) => (
            <Box key={doc.id}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  {/* Icon */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 3,
                      p: 2,
                      backgroundColor: `${doc.color}10`,
                      borderRadius: 2,
                    }}
                  >
                    {doc.icon}
                  </Box>

                  {/* Title */}
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 2, 
                      textAlign: 'center',
                      color: doc.color
                    }}
                  >
                    {doc.title}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ mb: 3, textAlign: 'center', lineHeight: 1.7 }}
                  >
                    {doc.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Features */}
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 700, mb: 2, color: '#555' }}
                  >
                    Key Features:
                  </Typography>
                  <Stack spacing={1.5}>
                    {doc.features.map((feature, index) => (
                      <Box 
                        key={index} 
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: doc.color 
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>

                {/* Action Button */}
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate(doc.path)}
                    sx={{
                      backgroundColor: doc.color,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: doc.color,
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    Create {doc.title}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Info Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3, 
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff9e6'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#f57c00' }}>
            💡 Quick Tip
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Quotations</strong> are perfect for providing price estimates to potential clients. 
            Once a quotation is accepted, you can easily convert it to an invoice. 
            <strong> Invoices</strong> are used for billing completed work and tracking payments.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
