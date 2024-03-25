import AddIcon from '@mui/icons-material/AddRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import SortRounded from '@mui/icons-material/SortRounded';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  Menu,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import { AppFrameworkProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import { getApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { StyledFilterButton } from 'src/styles/styled-filter-button';
import {
  currentNotification,
  currentUser as defaultUser,
} from '../../../store';
import { Item } from '../../../styles/styled-item';
import AppCard from '../app-card/app-card';

export const AppsGrid = (): React.ReactElement => {
  const [filtersAnchorEl, setFiltersAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [sortByAnchorEl, setSortByAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const filtersOpen = Boolean(filtersAnchorEl);
  const bulkActionsOpen = Boolean(bulkActionsAnchorEl);
  const sortByOpen = Boolean(sortByAnchorEl);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [apps, setApps] = useState<JhApp[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [frameworkValues, setFrameworkValues] = useState<string[]>([]);
  const [ownershipValue, setOwnershipValue] = useState('Any');
  const [sortByValue, setSortByValue] = useState('Recently modified');
  const [hasBulkSelections] = useState(false);

  const ownershipValues = ['Any', 'Owned by me', 'Shared with me'];
  const sortValues = ['Recently modified', 'Name: A-Z', 'Name: Z-A'];

  const {
    isLoading,
    error,
    data: serverData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get(`/server/`)
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const { data: frameworks, isLoading: frameworksLoading } = useQuery<
    AppFrameworkProps[],
    { message: string }
  >({
    queryKey: ['app-frameworks'],
    queryFn: () =>
      axios.get('/frameworks/').then((response) => {
        return response.data;
      }),
  });

  const filterAndSortApps = () => {
    const searchToLower = searchValue.toLowerCase();
    const ownershipType =
      ownershipValue === 'Owned by me'
        ? 'mine'
        : ownershipValue === 'Shared with me'
          ? 'shared'
          : 'all';

    // Get Apps based on ownership type and search value
    const apps = getApps(serverData, ownershipType)
      .filter(
        (app) =>
          app.name.toLowerCase().includes(searchToLower) ||
          app.description?.toLowerCase().includes(searchToLower) ||
          app.framework?.toLowerCase().includes(searchToLower),
      )
      .filter((app) => {
        if (frameworkValues.length > 0) {
          return frameworkValues.includes(app.framework);
        }
        return true;
      });

    // Sort Apps based on sort value
    apps.sort((a, b) => {
      if (sortByValue === 'Recently modified') {
        return a.last_activity > b.last_activity ? -1 : 1;
      } else if (sortByValue === 'Name: A-Z') {
        return a.name > b.name ? 1 : -1;
      }
      return a.name > b.name ? -1 : 1;
    });
    setApps(apps);
  };

  const handleSearch = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value);
  };

  const handleFrameworkChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (frameworkValues.includes(value)) {
      setFrameworkValues((prev) => prev.filter((item) => item !== value));
    } else {
      setFrameworkValues((prev) => [...prev, value]);
    }
  };

  const handleOwnershipTypeChange = (value: string) => {
    setOwnershipValue(value);
  };

  const handleSortByClick = (value: string) => {
    setSortByValue(value);
    filterAndSortApps();
    setSortByAnchorEl(null);
  };

  const handleApplyFilters = () => {
    setFiltersAnchorEl(null);
    filterAndSortApps();
  };

  const handleClearFilters = () => {
    setFrameworkValues([]);
    setOwnershipValue('Any');
  };

  useEffect(() => {
    if (!isLoading && serverData) {
      const filterToLower = searchValue.toLowerCase();
      setApps(() =>
        getApps(serverData, 'all').filter(
          (app) =>
            app.name.toLowerCase().includes(filterToLower) ||
            app.description?.toLowerCase().includes(filterToLower) ||
            app.framework?.toLowerCase().includes(filterToLower),
        ),
      );
    }
  }, [isLoading, serverData, searchValue]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <Box>
      <Stack>
        <Item>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Item>
                <h2>Apps</h2>
              </Item>
            </Grid>
            <Grid
              container
              item
              xs={8}
              md={8}
              direction="row"
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
              }}
            >
              <Item>
                <TextField
                  id="search"
                  size="small"
                  placeholder="Search..."
                  aria-label="Search for an app"
                  onChange={handleSearch}
                  sx={{
                    width: { sm: '200px', md: '300px', lg: '600px' },
                    pr: '16px',
                  }}
                />
              </Item>
              <Item>
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
              </Item>
            </Grid>
          </Grid>
        </Item>
        <Item sx={{ pt: '16px', pb: '24px' }}>
          <Divider />
        </Item>
        <Item>
          <Grid container spacing={2} paddingBottom="32px">
            <Grid item xs={12} md={4}>
              <Item>
                <StyledFilterButton
                  id="filters-btn"
                  variant="outlined"
                  color="secondary"
                  onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
                  startIcon={<FilterAltRoundedIcon />}
                  endIcon={
                    filtersOpen ? (
                      <KeyboardArrowUpRoundedIcon />
                    ) : (
                      <KeyboardArrowDownRoundedIcon />
                    )
                  }
                  disabled={frameworksLoading}
                >
                  Filters
                </StyledFilterButton>
                <Menu
                  id="filters-list"
                  anchorEl={filtersAnchorEl}
                  open={filtersOpen}
                  onClose={() => setFiltersAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'filters-btn',
                  }}
                >
                  <Box
                    component="form"
                    name="filters-form"
                    sx={{ width: '450px', px: '16px', py: '8px' }}
                  >
                    <FormLabel
                      id="frameworks-label"
                      sx={{
                        py: '16px',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Frameworks
                    </FormLabel>
                    <Box>
                      {frameworks?.map((framework) => (
                        <FormControlLabel
                          key={framework.name}
                          control={<Checkbox value={framework.display_name} />}
                          label={framework.display_name}
                          sx={{ width: '120px' }}
                          onClick={handleFrameworkChange}
                          checked={frameworkValues.includes(
                            framework.display_name,
                          )}
                        />
                      ))}
                    </Box>
                    <Divider sx={{ mt: '24px', mb: '16px' }} />
                    <FormLabel
                      id="ownership-label"
                      sx={{
                        pb: '16px',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Ownership
                    </FormLabel>
                    <Box sx={{ pb: '24px' }}>
                      <RadioGroup
                        aria-labelledby="ownership-label"
                        defaultValue="any"
                        name="ownership-group"
                        row
                      >
                        {ownershipValues.map((value) => (
                          <FormControlLabel
                            key={value}
                            control={<Radio value={value} />}
                            label={value}
                            onClick={() => handleOwnershipTypeChange(value)}
                            checked={ownershipValue === value}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                    <ButtonGroup>
                      <Button
                        id="clear-filters-btn"
                        variant="text"
                        color="secondary"
                        size="small"
                        onClick={handleClearFilters}
                      >
                        Clear
                      </Button>
                      <Button
                        id="apply-filters-btn"
                        variant="contained"
                        size="small"
                        onClick={handleApplyFilters}
                      >
                        Apply
                      </Button>
                    </ButtonGroup>
                  </Box>
                </Menu>
                <StyledFilterButton
                  id="bulk-actions-btn"
                  variant="outlined"
                  color="secondary"
                  onClick={(event) =>
                    setBulkActionsAnchorEl(event.currentTarget)
                  }
                  endIcon={
                    filtersOpen ? (
                      <KeyboardArrowUpRoundedIcon />
                    ) : (
                      <KeyboardArrowDownRoundedIcon />
                    )
                  }
                  disabled={!hasBulkSelections}
                >
                  Bulk Actions
                </StyledFilterButton>
                <Menu
                  id="bulk-actions-list"
                  anchorEl={bulkActionsAnchorEl}
                  open={bulkActionsOpen}
                  onClose={() => setBulkActionsAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'bulk-actions-btn',
                  }}
                >
                  <Box
                    component="form"
                    name="bulk-actions-form"
                    sx={{ px: '16px', py: '8px' }}
                  ></Box>
                </Menu>
              </Item>
            </Grid>
            <Grid
              container
              item
              xs={8}
              md={8}
              direction="row"
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
              }}
            >
              <Item>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <SortRounded sx={{ pr: '8px' }} />
                  <FormLabel
                    id="sort-by-label"
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      pr: '8px',
                      color: 'common.black',
                    }}
                  >
                    Sort by:
                  </FormLabel>
                  <Button
                    id="sort-by-btn"
                    variant="text"
                    color="secondary"
                    onClick={(event) => setSortByAnchorEl(event.currentTarget)}
                    sx={{
                      position: 'relative',
                      bottom: '8px',
                      fontWeight: 600,
                      width: '180px',
                      color: 'common.black',
                    }}
                    endIcon={
                      filtersOpen ? (
                        <KeyboardArrowUpRoundedIcon />
                      ) : (
                        <KeyboardArrowDownRoundedIcon />
                      )
                    }
                  >
                    {sortByValue}
                  </Button>
                  <Menu
                    id="sort-by-list"
                    anchorEl={sortByAnchorEl}
                    open={sortByOpen}
                    onClose={() => setSortByAnchorEl(null)}
                    MenuListProps={{
                      'aria-labelledby': 'sort-by-btn',
                    }}
                  >
                    <Box
                      component="form"
                      name="sort-by-form"
                      sx={{ px: '16px' }}
                    >
                      <RadioGroup
                        defaultValue="any"
                        name="sort-by-group"
                        aria-describedby="sort-by-label"
                      >
                        {sortValues.map((value) => (
                          <FormControlLabel
                            key={value}
                            control={<Radio value={value} />}
                            label={value}
                            onClick={() => handleSortByClick(value)}
                            checked={sortByValue === value}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  </Menu>
                </Box>
              </Item>
            </Grid>
          </Grid>
        </Item>
        <Item>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'flex-start',
              paddingBottom: '48px',
            }}
          >
            {isLoading ? (
              <div className="font-bold">Loading...</div>
            ) : apps.length > 0 ? (
              <>
                {apps.map((app: JhApp) => (
                  <AppCard
                    id={app.id}
                    key={`app-${app.id}`}
                    title={app.name}
                    description={app.description}
                    thumbnail={app.thumbnail}
                    framework={app.framework}
                    url={app.url}
                    ready={app.ready}
                    username={app.username}
                    isPublic={app.public}
                    isShared={ownershipValue === 'Shared' ? true : false}
                  />
                ))}
              </>
            ) : (
              <div>No apps available</div>
            )}
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};
