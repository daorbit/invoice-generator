import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DocumentSelectionPage } from '../pages/DocumentSelectionPage';
import { Box, CircularProgress } from '@mui/material';

/**
 * Smart Home Route Component
 * - Redirects authenticated (non-guest) users to /dashboard
 * - Shows document selection page for guest users
 */
export const HomeRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If user is authenticated and NOT a guest, redirect to dashboard
    if (isAuthenticated && user && !user.isAnonymous) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show document selection page for guests or unauthenticated users
  return <DocumentSelectionPage />;
};
