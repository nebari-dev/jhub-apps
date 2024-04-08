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
} from '@mui/material';
import { ButtonGroup } from '@src/components';
import { AppFrameworkProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { OWNERSHIP_TYPES, SORT_TYPES } from '@src/utils/constants';
import { filterAndSortApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { SyntheticEvent, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentFrameworks as defaultFrameworks,
  currentOwnershipValue as defaultOwnershipValue,
  currentSearchValue as defaultSearchValue,
  currentSortValue as defaultSortValue,
} from '../../../../store';
import { StyledFilterButton } from '../../../../styles/styled-filter-button';
import { Item } from '../../../../styles/styled-item';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AppFiltersProps {
  data: any;
  currentUser: UserState;
  setApps: React.Dispatch<React.SetStateAction<JhApp[]>>;
}

export const AppFilters = ({
  data,
  currentUser,
  setApps,
}: AppFiltersProps): React.ReactElement => {
  const [currentSearchValue] = useRecoilState<string>(defaultSearchValue);
  const [filtersAnchorEl, setFiltersAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [sortByAnchorEl, setSortByAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const filtersOpen = Boolean(filtersAnchorEl);
  const bulkActionsOpen = Boolean(bulkActionsAnchorEl);
  const sortByOpen = Boolean(sortByAnchorEl);
  const [currentFrameworks, setCurrentFrameworks] =
    useRecoilState<string[]>(defaultFrameworks);
  const [currentOwnershipValue, setCurrentOwnershipValue] = useRecoilState(
    defaultOwnershipValue,
  );
  const [currentSortValue, setCurrentSortValue] =
    useRecoilState(defaultSortValue);
  const [hasBulkSelections] = useState(false);

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
      ),
    );
    setSortByAnchorEl(null);
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
      ),
    );
  };

  const handleClearFilters = () => {
    setCurrentFrameworks([]);
    setCurrentOwnershipValue('Any');
  };

  return (
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
                    checked={currentFrameworks.includes(framework.display_name)}
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
                sortByOpen ? (
                  <KeyboardArrowUpRoundedIcon />
                ) : (
                  <KeyboardArrowDownRoundedIcon />
                )
              }
            >
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
            >
              <Box component="form" name="sort-by-form" sx={{ px: '16px' }}>
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
      </Grid>
    </Grid>
  );
};
