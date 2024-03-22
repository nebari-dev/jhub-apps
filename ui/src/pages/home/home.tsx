import { Box, Grid } from '@mui/material';
import React from 'react';
import { Item } from '../../styles/styled-item';
import { AppsGrid } from './apps-grid/apps-grid';
import './home.css';
import { ServicesGrid } from './services-grid/services-grid';

export const Home = (): React.ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }} className="container">
      <Grid container spacing={2} paddingBottom="48px">
        <Grid item xs={12} md={2}>
          <Item>
            <h1>Home</h1>
          </Item>
        </Grid>
      </Grid>
      <ServicesGrid />
      <AppsGrid />
    </Box>
  );
};
