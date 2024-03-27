import { Button, styled } from '@mui/material';

export const StyledFilterButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.black,
  borderColor: theme.palette.common.black,
  '&:hover': {
    color: theme.palette.common.black,
    borderColor: theme.palette.common.black,
  },
  marginRight: '16px',
}));
