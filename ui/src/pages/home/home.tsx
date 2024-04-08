import { Box, Grid } from '@mui/material';
import React from 'react';
import { Item } from '../../styles/styled-item';
import { AppsSection } from './apps-section/apps-section';
import { ServicesSection } from './services-section/services-section';

export const Home = (): React.ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }} className="container">
      <Grid container spacing={2} paddingBottom="32px">
        <Grid item xs={12} md={2}>
          <Item>
            <h1>Home</h1>
          </Item>
        </Grid>
      </Grid>
      <ServicesSection />
      <AppsSection />
    </Box>
  );
};
