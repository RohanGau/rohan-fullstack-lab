// src/layout/CustomMenu.tsx
import * as React from 'react';
import { Menu, MenuItemLink } from 'react-admin';
import UploadIcon from '@mui/icons-material/CloudUpload';

export const CustomMenu = () => (
  <Menu>
    <Menu.DashboardItem />
    <Menu.ResourceItems /> {/* auto-lists your <Resource name="..."> */}
    <MenuItemLink
      to="/assets"
      primaryText="Assets"
      leftIcon={<UploadIcon />}
    />
  </Menu>
);
