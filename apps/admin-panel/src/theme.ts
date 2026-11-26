import { createTheme } from '@mui/material/styles';

/** Light and dark follow the system setting cleanly across CSS variables and MUI components. */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: { light: true, dark: true },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { overscrollBehavior: 'contain' },
      },
    },
  },
});
