// src/layout/CustomAppBar.tsx
import * as React from 'react';
import { AppBar, UserMenu, Logout } from 'react-admin';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import UploadIcon from '@mui/icons-material/CloudUpload';
import { Link as RouterLink } from 'react-router-dom';

const MyUserMenu = () => (
  <UserMenu>
    {/* Quick jump to Assets from the user menu too */}
    <MenuItem component={RouterLink} to="/assets">
      <ListItemIcon><UploadIcon fontSize="small" /></ListItemIcon>
      <ListItemText>Assets</ListItemText>
    </MenuItem>
    {/* Logout only renders if you provide authProvider later */}
    <Logout />
  </UserMenu>
);

export const CustomAppBar = () => (
  <AppBar userMenu={<MyUserMenu />} />
);
