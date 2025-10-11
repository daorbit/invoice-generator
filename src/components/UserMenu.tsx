import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          p: 0,
          '&:hover': { bgcolor: 'transparent' }
        }}
        aria-controls={anchorEl ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? 'true' : undefined}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: user.isAnonymous ? '#6c757d' : '#0d6efd',
            fontSize: '14px',
            fontWeight: 600,
            border: '2px solid #e9ecef',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          {getInitials(user.username)}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            borderRadius: 2,
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
            {user.username}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.75rem' }}>
            {user.isAnonymous ? 'Guest Account' : 'Admin Account'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#e9ecef' }} />

        {/* Profile (Optional) */}
        {!user.isAnonymous && (
          <MenuItem 
            onClick={handleClose}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '0.875rem',
              color: '#495057',
              '&:hover': { bgcolor: '#f8f9fa' }
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#6c757d' }} />
            </ListItemIcon>
            Profile
          </MenuItem>
        )}

        {/* Logout */}
        <MenuItem 
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 3,
            fontSize: '0.875rem',
            color: '#495057',
            '&:hover': { bgcolor: '#f8f9fa' }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#6c757d' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};
