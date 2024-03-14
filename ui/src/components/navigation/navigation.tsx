import HomeIcon from '@mui/icons-material/Home';
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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { JhService, JhServiceFull } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import { getAppLogoUrl, getServices } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification, currentUser as defaultUser } from '../../store';

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

  const { isLoading, error, data } = useQuery<
    JhServiceFull[],
    { message: string }
  >({
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
    enabled: !!currentUser?.name,
  });

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleServiceNavigation = (url: string) => {
    document.location.href = url;
  };

  useEffect(() => {
    if (!isLoading && data && currentUser) {
      setServices(() => getServices(data, currentUser.name));
    }
  }, [isLoading, data, currentUser]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  useEffect(() => {
    if (isMobileBreakpoint) {
      setMobileOpen(false);
    } else {
      setMobileOpen(true);
    }
  }, [isMobileBreakpoint]);

  const drawer = (
    <Box sx={{ textAlign: 'left' }}>
      <ListItem disablePadding sx={{ mt: 10, mb: 2 }}>
        <ListItemButton
          sx={{ pl: 3 }}
          onClick={() => handleServiceNavigation(`${APP_BASE_URL}`)}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      <Divider />
      {services.find((item) => item.pinned) ? (
        <>
          <List>
            <ListItem disablePadding>
              <ListItemText
                primary="Pinned"
                disableTypography
                sx={{ fontWeight: 700, pl: 4, py: 1 }}
              />
            </ListItem>
            {services
              .filter((item) => item.pinned)
              .map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => handleServiceNavigation(item.url)}
                  >
                    <ListItemText primary={item.name} />
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <PushPinRoundedIcon />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <Divider />
        </>
      ) : (
        <></>
      )}
      <List>
        <ListItem disablePadding>
          <ListItemText
            primary="Services"
            disableTypography
            sx={{ fontWeight: 700, pl: 4, pt: 2, pb: 1 }}
          />
        </ListItem>
        {services.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => handleServiceNavigation(item.url)}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
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
              sx={{ color: 'white', fontWeight: 700 }}
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
                onClick={() =>
                  (document.location.href = `${APP_BASE_URL}/token`)
                }
                sx={{ width: '180px' }}
              >
                Tokens
              </MenuItem>
              <MenuItem
                onClick={() =>
                  (document.location.href = `${APP_BASE_URL}/admin`)
                }
              >
                Admin
              </MenuItem>
              <MenuItem
                onClick={() =>
                  (document.location.href = `${APP_BASE_URL}/logout`)
                }
              >
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
