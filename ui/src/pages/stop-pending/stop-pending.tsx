// src/pages/stop-pending/StopPending.tsx
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import React from 'react';
import './stop-pending.css';

export const StopPending = (): React.ReactElement => {
  return (
    <Box
      id="stop-pending"
      className="container"
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      padding="20px"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{ paddingBottom: '0 !important' }}
        >
          Thank you for your patience
          <br />
          We are stopping your application, you may start it again when we have
          finished
        </Typography>
        <CircularProgress style={{ color: '#a020f0', margin: '20px 0' }} />
      </Box>
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="body1" gutterBottom>
          You may return to the Application Screen at any time
        </Typography>
        <Button
          id="back-btn"
          variant="contained"
          color="primary"
          style={{ backgroundColor: '#a020f0' }}
          onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
        >
          Back To Home
        </Button>
      </Box>
    </Box>
  );
};
