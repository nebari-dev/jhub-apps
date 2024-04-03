import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MenuIcon from '@mui/icons-material/Menu';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  JhApp,
  JhService,
  JhServiceApp,
  JhServiceFull,
} from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL, DEFAULT_PINNED_SERVICES } from '@src/utils/constants';
import {
  getAppLogoUrl,
  getPinnedApps,
  getPinnedServices,
  getServices,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification, currentUser as defaultUser } from '../../store';

export const StyledListItemTextHeader = styled(ListItemText)(({ theme }) => ({
  fontWeight: 700,
  paddingLeft: theme.spacing(4),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
}));

export const TopNavigation = ({ ...props }): React.ReactElement => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const profileMenuOpen = Boolean(anchorEl);
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('sm')); // Use to determine if the drawer should be open or closed
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(
    isMobileBreakpoint ? false : true,
  );
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [services, setServices] = useState<JhService[]>([]);
  const [pinnedApps, setPinnedApps] = useState<JhApp[]>([]);
  const [pinnedServices, setPinnedServices] = useState<JhServiceApp[]>([]);

  const {
    isLoading: appsLoading,
    error: appsError,
    data: appsData,
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

  const {
    isLoading: servicesLoading,
    error: servicesError,
    data: servicesData,
  } = useQuery<JhServiceFull[], { message: string }>({
    queryKey: ['service-data'],
    queryFn: () =>
      axios
        .get('/services/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  useEffect(() => {
    if (!appsLoading && appsData && currentUser) {
      setPinnedApps(() => getPinnedApps(appsData, currentUser.name));
    }
  }, [appsLoading, appsData, currentUser]);

  useEffect(() => {
    if (!servicesLoading && servicesData && currentUser) {
      setServices(() =>
        getServices(servicesData, currentUser.name).filter(
          (service: JhService) =>
            !DEFAULT_PINNED_SERVICES.includes(service.name),
        ),
      );
      setPinnedServices(() =>
        getPinnedServices(servicesData, currentUser.name),
      );
    }
  }, [servicesLoading, servicesData, currentUser]);

  useEffect(() => {
    if (servicesError) {
      setCurrentNotification(servicesError.message);
    } else if (appsError) {
      setCurrentNotification(appsError.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [servicesError, appsError, setCurrentNotification]);

  useEffect(() => {
    if (isMobileBreakpoint) {
      setMobileOpen(false);
    } else {
      setMobileOpen(true);
    }
  }, [isMobileBreakpoint]);

  const drawer = (
    <Box>
      <ListItem disablePadding sx={{ mt: 10, mb: 2 }}>
        <ListItemButton
          sx={{ pl: 3 }}
          onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
        >
          <ListItemIcon>
            <HomeRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      <Divider />
      <>
        <List>
          <ListItem disablePadding>
            <StyledListItemTextHeader primary="Pinned" disableTypography />
          </ListItem>
          {pinnedApps.map((item, index) => (
            <ListItem key={index} disablePadding>
              <StyledListItemButton onClick={() => navigateToUrl(item.url)}>
                <ListItemText primary={item.name} />
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <PushPinRoundedIcon fontSize="small" />
                </ListItemIcon>
              </StyledListItemButton>
            </ListItem>
          ))}
          {pinnedServices.map((item, index) => (
            <ListItem key={index} disablePadding>
              <StyledListItemButton onClick={() => navigateToUrl(item.url)}>
                <ListItemText primary={item.name} />
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <PushPinRoundedIcon fontSize="small" />
                </ListItemIcon>
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </>
      <List>
        <ListItem disablePadding>
          <StyledListItemTextHeader
            primary="Services"
            disableTypography
            sx={{ pt: 2 }}
          />
        </ListItem>
        {services.map((item, index) => (
          <ListItem key={index} disablePadding>
            <StyledListItemButton onClick={() => navigateToUrl(item.url)}>
              <ListItemText primary={item.name} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: (theme) => theme.palette.common.black,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <a href={APP_BASE_URL}>
              <img src={getAppLogoUrl()} alt="logo" height="28" />
            </a>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button
              id="profile-menu-btn"
              aria-controls={profileMenuOpen ? 'profile-menu-list' : undefined}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen ? 'true' : undefined}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              endIcon={
                profileMenuOpen ? (
                  <KeyboardArrowUpRoundedIcon />
                ) : (
                  <KeyboardArrowDownRoundedIcon />
                )
              }
              sx={{ color: theme.palette.common.white, fontWeight: 700 }}
            >
              {currentUser?.name} {currentUser?.admin ? '(admin)' : ''}
            </Button>
            <Menu
              id="profile-menu-list"
              anchorEl={anchorEl}
              open={profileMenuOpen}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{
                'aria-labelledby': 'profile-menu-btn',
              }}
              sx={{ marginTop: '20px' }}
            >
              <MenuItem
                onClick={() => navigateToUrl(`${APP_BASE_URL}/token`)}
                sx={{ width: '180px' }}
              >
                Tokens
              </MenuItem>
              {currentUser?.admin && (
                <MenuItem
                  onClick={() => navigateToUrl(`${APP_BASE_URL}/admin`)}
                >
                  Admin
                </MenuItem>
              )}
              <MenuItem onClick={() => navigateToUrl(`${APP_BASE_URL}/logout`)}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={
            window !== undefined ? () => window().document.body : undefined
          }
          variant="persistent"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};

export default TopNavigation;
