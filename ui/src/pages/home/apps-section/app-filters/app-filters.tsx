import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import SortRounded from '@mui/icons-material/SortRounded';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import TableRowsIcon from '@mui/icons-material/TableRows';
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
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import { AppFrameworkProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import {
  OWNERSHIP_TYPES,
  SERVER_STATUSES,
  SORT_TYPES,
} from '@src/utils/constants';
import { filterAndSortApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentFrameworks as defaultFrameworks,
  currentOwnershipValue as defaultOwnershipValue,
  currentSearchValue as defaultSearchValue,
  currentServerStatuses as defaultServerStatuses,
  currentSortValue as defaultSortValue,
} from '../../../../store';
import { StyledFilterButton } from '../../../../styles/styled-filter-button';
import { Item } from '../../../../styles/styled-item';
import './app-filters.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AppFiltersProps {
  data: any;
  currentUser: UserState;
  setApps: React.Dispatch<React.SetStateAction<JhApp[]>>;
  isGridViewActive: boolean;
  toggleView: () => void;
}

export const AppFilters = ({
  data,
  currentUser,
  isGridViewActive,
  toggleView,
  setApps,
}: AppFiltersProps): React.ReactElement => {
  const [currentSearchValue] = useRecoilState<string>(defaultSearchValue);
  const [filtersAnchorEl, setFiltersAnchorEl] =
    React.useState<null | HTMLElement>(null);
  // const [bulkActionsAnchorEl, setBulkActionsAnchorEl] =
  // React.useState<null | HTMLElement>(null); // Not using now, may in the future
  const [sortByAnchorEl, setSortByAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const filtersOpen = Boolean(filtersAnchorEl);
  // const bulkActionsOpen = Boolean(bulkActionsAnchorEl); // Not using now, may in the future
  const sortByOpen = Boolean(sortByAnchorEl);
  const [currentFrameworks, setCurrentFrameworks] =
    useRecoilState<string[]>(defaultFrameworks);
  const [currentOwnershipValue, setCurrentOwnershipValue] = useRecoilState(
    defaultOwnershipValue,
  );
  const [currentSortValue, setCurrentSortValue] =
    useRecoilState(defaultSortValue);
  // const [hasBulkSelections] = useState(false); // Not using now, may in the future
  const [currentServerStatuses, setCurrentServerStatuses] = useRecoilState<
    string[]
  >(defaultServerStatuses);
  const [filteredCount, setFilteredCount] = useState(0);
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

  const handleFrameworkChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (currentFrameworks.includes(value)) {
      setCurrentFrameworks((prev) => prev.filter((item) => item !== value));
    } else {
      setCurrentFrameworks((prev) => [...prev, value]);
    }
  };

  const handleOwnershipTypeChange = (value: string) => {
    setCurrentOwnershipValue(value);
  };

  const handleSortByClick = (value: string) => {
    setCurrentSortValue(value);
    setApps(
      filterAndSortApps(
        data,
        currentUser,
        currentSearchValue,
        currentOwnershipValue,
        currentFrameworks,
        value,
        currentServerStatuses,
      ),
    );
    setSortByAnchorEl(null);
  };

  const handleServerStatusChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (currentServerStatuses.includes(value)) {
      setCurrentServerStatuses((prev) => prev.filter((item) => item !== value));
    } else {
      setCurrentServerStatuses((prev) => [...prev, value]);
    }
  };

  const handleApplyFilters = () => {
    setFiltersAnchorEl(null);
    setApps(
      filterAndSortApps(
        data,
        currentUser,
        currentSearchValue,
        currentOwnershipValue,
        currentFrameworks,
        currentSortValue,
        currentServerStatuses,
      ),
    );
  };
  const handleClearFilters = () => {
    setCurrentFrameworks([]);
    setCurrentOwnershipValue('Any');
    setCurrentServerStatuses([]);
  };

  const calculateFilteredCount = useCallback(() => {
    const filteredApps = filterAndSortApps(
      data,
      currentUser,
      currentSearchValue,
      currentOwnershipValue,
      currentFrameworks,
      currentSortValue,
      currentServerStatuses,
    );
    return filteredApps.length;
  }, [
    data,
    currentUser,
    currentSearchValue,
    currentOwnershipValue,
    currentFrameworks,
    currentSortValue,
    currentServerStatuses,
  ]);

  useEffect(() => {
    setFilteredCount(calculateFilteredCount());
  }, [calculateFilteredCount]);
  return (
    <Grid container spacing={2} paddingBottom="32px">
      <Grid item xs={12} md={4}>
        <Item sx={{ pb: 0 }}>
          <StyledFilterButton
            id="filters-btn"
            variant="text"
            color="secondary"
            onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
            startIcon={<FilterAltRoundedIcon />}
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              top: '-8px',
              background: 'none',
            }}
            endIcon={
              filtersOpen ? (
                <KeyboardArrowUpRoundedIcon />
              ) : (
                <KeyboardArrowDownRoundedIcon />
              )
            }
            disabled={frameworksLoading || false}
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
              style: { paddingTop: 0, paddingBottom: 0 },
              sx: {
                '.MuiFormLabel-root': { fontSize: '14px' },
                '.MuiFormControlLabel-label': {
                  fontSize: '14px', // Targets labels within FormControlLabel
                },
              },
            }}
          >
            <Box
              component="form"
              name="filters-form"
              id="filters-form"
              sx={{
                width: '450px',
                px: '16px',
                pb: 0,
                mt: 3,
              }}
            >
              <FormLabel
                id="frameworks-label"
                sx={{
                  py: '16px',
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
                    sx={{
                      width: '120px',
                      '& > :last-child': {
                        minWidth: '100%',
                      },
                    }}
                    onClick={handleFrameworkChange}
                    checked={currentFrameworks.includes(framework.display_name)}
                  />
                ))}
              </Box>
              <Divider sx={{ mt: '24px', mb: '16px' }} />
              <FormLabel
                id="server-statuses-label"
                sx={{
                  pb: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Server Status
              </FormLabel>
              <Box>
                {SERVER_STATUSES.map((status) => (
                  <FormControlLabel
                    key={status}
                    control={<Checkbox value={status} />}
                    label={status}
                    onClick={handleServerStatusChange}
                    checked={currentServerStatuses.includes(status)}
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
              <Box>
                <RadioGroup
                  aria-labelledby="ownership-label"
                  defaultValue="any"
                  name="ownership-group"
                  sx={{
                    '& .MuiFormControlLabel-root': {
                      pb: '3px',
                    },
                  }}
                  row
                >
                  {OWNERSHIP_TYPES.map((value) => (
                    <FormControlLabel
                      key={value}
                      control={<Radio value={value} />}
                      label={value}
                      onClick={() => handleOwnershipTypeChange(value)}
                      checked={currentOwnershipValue === value}
                    />
                  ))}
                </RadioGroup>
              </Box>
              <Box
                sx={{
                  backgroundColor: '#EEE',
                  p: 1,
                  pt: 0.75,
                  mx: -2,
                  width: 'auto',
                  fontSize: '14px',
                }}
              >
                <ButtonGroup>
                  <Button
                    id="clear-filters-btn"
                    data-testid="clear-filters-btn"
                    variant="text"
                    sx={{
                      color: '#0F1015',
                      display: 'flex',
                      alignItems: 'center',
                    }}
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
                    sx={{ px: 'none !important', minWidth: '20px' }}
                  >
                    Show {filteredCount} results
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          </Menu>
          {/* <StyledFilterButton   // Not using now, may in the future
            id="bulk-actions-btn"
            variant="outlined"
            color="secondary"
            onClick={(event) => setBulkActionsAnchorEl(event.currentTarget)}
            endIcon={
              bulkActionsOpen ? (
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
          </Menu> */}
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
            <Button
              id="sort-by-btn"
              variant="text"
              color="secondary"
              onClick={(event) => setSortByAnchorEl(event.currentTarget)}
              sx={{
                position: 'relative',
                bottom: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'common.black',
                mr: '24px',
              }}
              endIcon={
                sortByOpen ? (
                  <KeyboardArrowUpRoundedIcon />
                ) : (
                  <KeyboardArrowDownRoundedIcon />
                )
              }
            >
              <SortRounded sx={{ position: 'relative', marginRight: '8px' }} />
              {currentSortValue}
            </Button>
            <Menu
              id="sort-by-list"
              anchorEl={sortByAnchorEl}
              open={sortByOpen}
              onClose={() => setSortByAnchorEl(null)}
              MenuListProps={{
                'aria-labelledby': 'sort-by-btn',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                transform: 'translateX(-85px)', // Move menu left/right
                '.MuiFormControlLabel-label': {
                  fontSize: '14px', // Applies to all labels in the FormControlLabel within this Menu
                },
              }}
            >
              <Box
                component="form"
                name="sort-by-form"
                sx={{ px: '16px', width: '220px' }}
              >
                <RadioGroup
                  defaultValue="any"
                  name="sort-by-group"
                  aria-describedby="sort-by-label"
                >
                  {SORT_TYPES.map((value) => (
                    <FormControlLabel
                      key={value}
                      control={<Radio value={value} />}
                      label={value}
                      onClick={() => handleSortByClick(value)}
                      checked={currentSortValue === value}
                    />
                  ))}
                </RadioGroup>
              </Box>
            </Menu>
          </Box>
        </Item>
        <Item>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              border: '1px solid #DFDFE0',
              borderRadius: '4px',
              position: 'relative',
              top: '-6px',
            }}
          >
            <Button
              onClick={toggleView}
              disabled={isGridViewActive}
              aria-label="Grid View"
              sx={{
                color: 'inherit',
                backgroundColor: isGridViewActive ? '#E8E8EA' : 'transparent',
                boxShadow: 'none',
                padding: '5px',
                minWidth: 'auto',
                borderRadius: '4px 0px 0px 4px',
                borderRight: '1px solid #DFDFE0',
                '&:hover': {
                  backgroundColor: isGridViewActive ? '#E8E8EA' : 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              <SpaceDashboardIcon
                sx={{ color: isGridViewActive ? '#2E2F33' : '#76777B' }}
              />
            </Button>
            <Button
              onClick={toggleView}
              disabled={!isGridViewActive}
              aria-label="Table View"
              sx={{
                color: 'inherit',
                backgroundColor: !isGridViewActive ? '#E8E8EA' : 'transparent',
                boxShadow: 'none',
                borderRadius: '0px 4px 4px 0px',
                padding: '5px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: !isGridViewActive
                    ? '#E8E8EA'
                    : 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              <TableRowsIcon
                sx={{ color: !isGridViewActive ? '#2E2F33' : '#76777B' }}
              />
            </Button>
          </Box>
        </Item>
      </Grid>
    </Grid>
  );
};
