import { createTheme } from '@mui/material/styles';

/** Light and dark follow the system setting. */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: { light: true, dark: true },
});
