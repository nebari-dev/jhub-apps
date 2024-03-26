import { createTheme } from '@mui/material';
import { PaletteColorOptions } from '@mui/material/styles';

import {
  black,
  blue,
  gray,
  green,
  greenDark,
  greenLight,
  orange,
  purple,
  purpleDark,
  purpleLight,
  red,
  white,
} from './colors';

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
        style: {
          textTransform: 'none',
          textWrap: 'nowrap',
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
        sx: {
          marginBottom: '12px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        autoComplete: 'off',
        fullWidth: true,
        sx: { marginBottom: '0' },
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
        light: purpleLight,
        main: purple,
        dark: purpleDark,
        contrastText: white,
      },
      name: 'primary',
    }),
    secondary: baseTheme.palette.augmentColor({
      color: {
        light: greenLight,
        main: green,
        dark: greenDark,
        contrastText: white,
      },
      name: 'secondary',
    }),
    gray: baseTheme.palette.augmentColor({
      color: {
        light: gray[300],
        main: gray[500],
        dark: gray[700],
        contrastText: black,
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
            backgroundColor: `${purple}`,
            border: `1px solid ${purple}`,
            fontWeight: 700,
            '&:hover': {
              backgroundColor: `${purpleDark}`,
            },
            '&:disabled': {
              borderColor: 'transparent',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            minWidth: '120px',
            backgroundColor: gray[100],
            border: `1px solid ${gray[100]}`,
            color: gray[700],
            fontWeight: 700,
            '&:hover': {
              backgroundColor: white,
              filter: 'brightness(0.96)',
            },
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
            border: `2px solid ${green}`,
            color: `${green}`,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: white,
              borderWidth: 2,
              border: `2px solid ${green}`,
              color: `${green}`,
            },
          },
        },
        {
          props: { variant: 'text', color: 'primary' },
          style: {
            color: `${purple}`,
            '&:focus': {
              backgroundColor: `${purpleLight}`,
            },
          },
        },
        {
          props: { variant: 'text', color: 'secondary' },
          style: {
            minWidth: '100px',
            color: gray[500],
            '&:focus': {
              backgroundColor: `${gray[100]}`,
            },
          },
        },
      ],
    },
  },
});
