import { createTheme } from '@mui/material';
import { PaletteColorOptions } from '@mui/material/styles';

import {
  black,
  blue,
  disabled,
  gray,
  grayLighter,
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

  interface Palette {
    accent: PaletteColor;
    gray: PaletteColor;
    blue: PaletteColor;
  }

  interface PaletteOptions {
    accent?: PaletteColorOptions;
    gray?: PaletteColorOptions;
    blue?: PaletteColorOptions;
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
    lighter: string;
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
    lighter?: string;
  }
}

const baseTheme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: {
      letterSpacing: '-1.5px',
      fontSize: '96px',
    },
    h2: {
      letterSpacing: '0.5px',
      fontSize: '60px',
    },
    h3: {
      letterSpacing: '0px',
      fontSize: '48px',
    },
    h4: {
      letterSpacing: '0.25px',
      fontSize: '34px',
    },
    h5: {
      letterSpacing: '0px',
      fontSize: '24px',
      fontWeight: 600,
      paddingBottom: '16px',
    },
    h6: {
      letterSpacing: '0.15px',
      fontSize: '20px',
      fontWeight: 700,
      paddingBottom: '16px',
    },
    subtitle1: {
      letterSpacing: '0.15px',
      fontSize: '16px',
      fontWeight: 600,
      paddingBottom: '24px',
    },
    subtitle2: {
      letterSpacing: '0.1px',
      fontSize: '14px',
      fontWeight: 500,
      paddingBottom: '24px',
    },
    body1: {
      letterSpacing: '0.15px',
      fontSize: '16px',
    },
    body2: {
      letterSpacing: '0.17px',
      fontSize: '14px',
    },
    caption: {
      letterSpacing: '0.4px',
    },
    overline: {
      letterSpacing: '1px',
      fontSize: '12px',
    },
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
          marginBottom: '24px',
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
    blue: baseTheme.palette.augmentColor({
      color: {
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
      name: 'blue',
    }),
    gray: baseTheme.palette.augmentColor({
      color: {
        light: gray[300],
        lighter: grayLighter,
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
            backgroundColor: `${purple}`,
            fontWeight: 700,
            '&:hover': {
              backgroundColor: `${purpleDark}`,
            },
            '&:disabled': {
              color: disabled,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: gray[200],
            border: `1px solid ${gray[200]}`,
            color: black,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: gray[300],
              border: `1px solid ${gray[300]}`,
            },
            '&:disabled': {
              color: disabled,
              borderColor: 'transparent',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: {
            fontWeight: 600,
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            backgroundColor: white,
            border: `2px solid ${purple}`,
            color: `${purple}`,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: white,
              borderWidth: 2,
              border: `2px solid ${purple}`,
              color: `${purple}`,
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
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
            '&:hover': {
              backgroundColor: `${purpleLight}`,
            },
            '&:focus': {
              backgroundColor: `${purpleLight}`,
            },
            '&:disabled': {
              color: disabled,
            },
          },
        },
        {
          props: { variant: 'text', color: 'secondary' },
          style: {
            color: black,
            '&:hover': {
              backgroundColor: `${gray[50]}`,
            },
            '&:focus': {
              backgroundColor: `${gray[50]}`,
            },
            '&:disabled': {
              color: disabled,
            },
          },
        },
      ],
    },
  },
});
