// src/layout/CustomLayout.tsx
import * as React from 'react';
import { Layout, LayoutProps } from 'react-admin';
import { CustomAppBar } from '../components/CustomAppBar';
import { CustomMenu } from '../components/CustomMenu';

export const CustomLayout = (props: LayoutProps) => (
  <Layout {...props} menu={CustomMenu} appBar={CustomAppBar} />
);
