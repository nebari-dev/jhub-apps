import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Grid, TextField } from '@mui/material';
import { API_BASE_URL } from '@src/utils/constants';
import React, { SyntheticEvent, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Item } from 'src/styles/styled-item';
import { currentNotification } from '../../store';
import { AppsGrid } from './apps-grid/apps-grid';
import './home.css';
import { ServicesGrid } from './services-grid/services-grid';

export const Home = (): React.ReactElement => {
  const [notification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value);
  };

  return (
    <Box sx={{ flexGrow: 1 }} className="container">
      <Grid container spacing={2} paddingBottom="48px">
        <Grid item xs={12} md={2}>
          <Item>
            <h1>Home</h1>
          </Item>
        </Grid>
        <Grid item xs={8} md={8}>
          <Item>
            <TextField
              id="search"
              size="small"
              placeholder="Search..."
              aria-label="Search for an app"
              className="search-bar"
              onChange={handleSearch}
            />
          </Item>
        </Grid>
        <Grid item xs={4} md={2}>
          <Item>
            <Box display="flex" justifyContent="flex-end">
              <Button
                id="create-app"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/create-app`;
                }}
              >
                Create App
              </Button>
            </Box>
          </Item>
        </Grid>
      </Grid>
      {notification && (
        <Grid container spacing={2} paddingBottom="8px">
          <Grid item>
            <Item>
              <Alert id="alert-notification" severity="error">
                {notification}
              </Alert>
            </Item>
          </Grid>
        </Grid>
      )}
      <ServicesGrid />
      <AppsGrid appType="My" filter={searchValue} />
      <AppsGrid appType="Shared" filter={searchValue} />
    </Box>
  );
};
