import { createTheme } from '@mui/material';
import { PaletteColorOptions } from '@mui/material/styles';

import { black, blue, gray, green, orange, red, white } from './colors';

declare module '@mui/material/styles' {
  interface Palette {
    accent: PaletteColor;
  }

  interface PaletteOptions {
    accent?: PaletteColorOptions;
  }

  interface PaletteColor {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface SimplePaletteColorOptions {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  }
}

const baseTheme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        autoComplete: 'off',
        fullWidth: true,
      },
    },
    MuiSelect: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
});

export const theme = createTheme(baseTheme, {
  palette: {
    primary: baseTheme.palette.augmentColor({
      color: {
        light: blue[300],
        main: blue[500],
        dark: blue[700],
        contrastText: white,
        50: blue[50],
        100: blue[100],
        200: blue[200],
        300: blue[300],
        400: blue[400],
        500: blue[500],
        600: blue[600],
        700: blue[700],
        800: blue[800],
        900: blue[900],
      },
      name: 'primary',
    }),
    secondary: baseTheme.palette.augmentColor({
      color: {
        light: green[300],
        main: green[500],
        dark: green[700],
        contrastText: green[500],
        50: green[50],
        100: green[100],
        200: green[200],
        300: green[300],
        400: green[400],
        500: green[500],
        600: green[600],
        700: green[700],
        800: green[800],
        900: green[900],
      },
      name: 'secondary',
    }),
    gray: baseTheme.palette.augmentColor({
      color: {
        light: gray[300],
        main: gray[500],
        dark: gray[700],
        contrastText: white,
        50: gray[50],
        100: gray[100],
        200: gray[200],
        300: gray[300],
        400: gray[400],
        500: gray[500],
        600: gray[600],
        700: gray[700],
        800: gray[800],
        900: gray[900],
      },
      name: 'gray',
    }),
    warning: {
      main: orange,
      contrastText: white,
    },
    error: {
      main: red,
      contrastText: white,
    },
    info: {
      main: blue,
      contrastText: white,
    },
    success: {
      main: green[500],
      contrastText: white,
    },
    common: {
      black: black,
      white: white,
    },
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            minWidth: '120px',
            backgroundColor: blue[500],
            border: `1px solid ${blue[500]}`,
            fontWeight: 700,
            textTransform: 'none',
            '&:disabled': {
              borderColor: 'transparent',
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            minWidth: '120px',
            backgroundColor: white,
            border: `2px solid ${blue[500]}`,
            color: blue[500],
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: white,
              borderWidth: 2,
              border: `2px solid ${blue[700]}`,
              color: blue[700],
            },
          },
        },
      ],
    },
  },
});
