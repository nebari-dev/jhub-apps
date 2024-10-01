import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
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
import {
  currentNotification,
  isHeadless as defaultIsHeadless,
  currentUser as defaultUser,
} from '../../store';
import './navigation.css';
export const StyledListItemTextHeader = styled(ListItemText)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '16px',
  paddingLeft: theme.spacing(4),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const StyledListItemTextHeaderWithIcon = styled(ListItemText)(
  ({ theme }) => ({
    fontWeight: 400,
    fontSize: '16px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  }),
);

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
}));

export const TopNavigation = ({ ...props }): React.ReactElement => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const profileMenuOpen = Boolean(anchorEl);
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('sm')); // Use to determine if the drawer should be open or closed
  // eslint-disable-next-line react/prop-types
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
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);

  const {
    isLoading: appsLoading,
    error: appsError,
    data: appsData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get('/server/')
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
      <List>
        <ListItem disablePadding sx={{ mt: 10 }}>
          <ListItemButton
            sx={{
              px: '1.5rem',
              mx: '.5rem',
              backgroundColor: theme.palette.primary.light,
              borderRadius: '8px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '8px',
                backgroundColor: theme.palette.primary.main,
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
              },
              '&:hover': {
                backgroundColor: theme.palette.gray[50],
                '&::before': {
                  backgroundColor: theme.palette.primary.main,
                },
              },
            }}
            onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
          >
            <ListItemIcon
              sx={{
                minWidth: 'auto',
                mr: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HomeRoundedIcon
                sx={{
                  color: theme.palette.common.black,
                  width: '28px',
                  height: '28px',
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '1.2',
                    position: 'relative',
                    top: '2px',
                  }}
                >
                  Home
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      </List>
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <StyledListItemTextHeaderWithIcon
            primary="Services"
            disableTypography
            sx={{
              px: '24px',
              py: '4px',
              fontSize: '14px',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'rgba(15 16 21 / 60%)',
            }}
          />
        </ListItem>
        {pinnedApps.map((item, index) => (
          <ListItem key={index} disablePadding>
            <Link
              href={item.url}
              sx={{
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'block',
                width: '100%',
                px: '24px',
                py: '4px',
                color: 'rgb(15 16 21 / 87%)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  textDecoration: 'none',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '1rem', color: 'rgb(15 16 21 / 87%)' }}
                  >
                    {item.name}
                  </Typography>
                }
              />
            </Link>
          </ListItem>
        ))}
        {pinnedServices.map((item, index) => (
          <ListItem key={index} disablePadding>
            <Link
              href={item.url}
              sx={{
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'block',
                width: '100%',
                px: '24px',
                py: '4px',
                color: 'rgb(15 16 21 / 87%)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  textDecoration: 'none',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '1rem', color: 'rgb(15 16 21 / 87%)' }}
                  >
                    {item.name}
                  </Typography>
                }
              />
            </Link>
          </ListItem>
        ))}
        {services.map((item, index) => (
          <ListItem key={index} disablePadding>
            <Link
              href={item.url}
              sx={{
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'block',
                width: '100%',
                px: '24px',
                py: '4px',
                color: 'rgb(15 16 21 / 87%)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  textDecoration: 'none',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '1rem', color: 'rgb(15 16 21 / 87%)' }}
                  >
                    {item.name}
                  </Typography>
                }
              />
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }} hidden={isHeadless}>
      <AppBar
        id="app-bar"
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: (theme) => theme.palette.common.white,
        }}
      >
        <Toolbar id="toolbar">
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
            <Link href={APP_BASE_URL}>
              <img src={getAppLogoUrl()} alt="logo" height="28" />
            </Link>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button
              id="profile-menu-btn"
              className="button-menu"
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
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.gray[50],
                },
              }}
            >
              {currentUser?.name}{' '}
              {currentUser?.admin && (
                <Chip
                  label="admin"
                  size="small"
                  className="chip"
                  sx={{
                    marginLeft: theme.spacing(1),
                  }}
                />
              )}
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
              width: 224,
              boxShadow: 1,
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
