import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Button, buttonVariants } from '@src/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@src/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import {
  MenuBarActions,
  MenuBarBrand,
  NavigationMenu,
} from '@src/components/ui/navigation-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarProvider,
} from '@src/components/ui/sidebar';
import { useTheme } from '@src/hooks/theme-provider';
import { useMediaQuery } from '@src/hooks/use-media-query';
import { isThemeMode, type ThemeMode } from '@src/hooks/use-theme-preference';
import { cn } from '@src/lib/utils';
import type { ServersData } from '@src/types/api';
import type { JhApp, JhService, JhServiceFull } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getAppLogoUrl,
  getPinnedApps,
  getServices,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  Home as HomeIcon,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  isHeadless as defaultIsHeadless,
  currentUser as defaultUser,
} from '../../store';

export const TopNavigation = (): React.ReactElement => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isMobileBreakpoint = useMediaQuery('(max-width: 599.95px)');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [services, setServices] = useState<JhService[]>([]);
  const [pinnedApps, setPinnedApps] = useState<JhApp[]>([]);
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const { themeMode, isDarkMode, setThemeMode } = useTheme();

  const {
    isLoading: appsLoading,
    error: appsError,
    data: appsData,
  } = useQuery<ServersData, { message: string }>({
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

  useEffect(() => {
    if (!appsLoading && appsData && currentUser) {
      setPinnedApps(() => getPinnedApps(appsData, currentUser.name));
    }
  }, [appsLoading, appsData, currentUser]);

  useEffect(() => {
    if (!servicesLoading && servicesData && currentUser) {
      setServices(() => {
        const allServices = getServices(servicesData, currentUser.name);
        return allServices.sort((a, b) => {
          const aIsPinned = a.pinned ? 1 : 0;
          const bIsPinned = b.pinned ? 1 : 0;
          return bIsPinned - aIsPinned;
        });
      });
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
    if (!isMobileBreakpoint) {
      setMobileDrawerOpen(false);
    }
  }, [isMobileBreakpoint]);

  const logoUrl = getAppLogoUrl(isDarkMode);
  const initials = (currentUser?.name ?? '?').slice(0, 2).toUpperCase();

  const sidebarContent = (
    <SidebarContent className="pt-4">
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              active
              variant="ghost"
              render={<a href={APP_BASE_URL} />}
            >
              <HomeIcon aria-hidden="true" />
              <SidebarMenuLabel>Home</SidebarMenuLabel>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="mt-2">
        <SidebarGroupLabel>Services</SidebarGroupLabel>
        <SidebarMenu>
          {pinnedApps.map((item) => (
            <SidebarMenuItem key={`pinned-${item.name}`}>
              <SidebarMenuButton variant="ghost" render={<a href={item.url} />}>
                <SidebarMenuLabel>{item.name}</SidebarMenuLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {services.map((item) => (
            <SidebarMenuItem key={`service-${item.name}`}>
              <SidebarMenuButton variant="ghost" render={<a href={item.url} />}>
                <SidebarMenuLabel>{item.name}</SidebarMenuLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );

  return (
    <SidebarProvider>
      <div hidden={isHeadless}>
        <NavigationMenu
          id="app-bar"
          className="fixed inset-x-0 top-(--top-banner-height,0px) z-40 h-14 justify-between border-header-border bg-header-background pl-4 text-header-foreground"
        >
          <div id="toolbar" className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="open drawer"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="text-header-foreground hover:bg-header-action-hover active:bg-header-action-hover sm:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <MenuBarBrand href={APP_BASE_URL} aria-label="Go to homepage">
              {logoUrl ? (
                <img
                  id="app-logo"
                  src={logoUrl}
                  alt="logo"
                  // In dark mode the default logo swaps to its white-text
                  // variant (like the landing page). If a custom/branded logo
                  // has no such variant, the URL is unchanged — fall back to
                  // monochrome-white so it stays legible on the dark header.
                  className={cn(
                    'h-8 w-auto',
                    isDarkMode &&
                      logoUrl === getAppLogoUrl(false) &&
                      'brightness-0 invert',
                  )}
                />
              ) : null}
            </MenuBarBrand>
          </div>

          <MenuBarActions className="gap-2">
            {currentUser ? (
              <DropdownMenu
                modal={false}
                open={profileMenuOpen}
                onOpenChange={setProfileMenuOpen}
              >
                <DropdownMenuTrigger
                  // Rendered as a plain <button> (styled via buttonVariants)
                  // rather than the registry <Button>: under React 18 the ref
                  // Base UI needs to anchor the menu is dropped by a
                  // function-component render target.
                  render={
                    <button
                      type="button"
                      className={buttonVariants({ variant: 'ghost' })}
                    />
                  }
                  id="profile-menu-btn"
                  variant="ghost"
                  aria-label="Account menu"
                  className="h-auto px-2.5 py-1 font-medium text-header-foreground hover:bg-header-action-hover hover:no-underline focus-visible:ring-offset-0 active:bg-header-action-hover data-[popup-open]:bg-header-action-hover data-[popup-open]:no-underline"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {initials}
                  </span>
                  <span className="max-sm:hidden">{currentUser.name}</span>
                  {profileMenuOpen ? (
                    <ChevronUp aria-hidden="true" />
                  ) : (
                    <ChevronDown aria-hidden="true" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    id="profile-menu-list"
                    align="end"
                    sideOffset={8}
                    className="w-[248px] p-2"
                  >
                    <div className="border-b px-1.5 pb-2">
                      <p className="text-sm font-medium text-foreground">
                        {currentUser.name}
                      </p>
                      {currentUser.admin && (
                        <p className="text-xs text-muted-foreground">
                          Administrator
                        </p>
                      )}
                    </div>

                    <div className="py-2">
                      <MenuPrimitive.RadioGroup
                        aria-label="Theme"
                        value={themeMode}
                        onValueChange={(value) => {
                          if (isThemeMode(value)) {
                            setThemeMode(value);
                          }
                        }}
                        className="flex h-[34px] items-center gap-1 rounded-md bg-muted p-1"
                      >
                        <ThemeOption
                          value="light"
                          label="Light mode"
                          text="Light"
                        >
                          <Sun className="h-4 w-4" />
                        </ThemeOption>
                        <ThemeOption value="dark" label="Dark mode" text="Dark">
                          <Moon className="h-4 w-4" />
                        </ThemeOption>
                        <ThemeOption
                          value="system"
                          label="System theme"
                          text="System"
                        >
                          <Monitor className="h-4 w-4" />
                        </ThemeOption>
                      </MenuPrimitive.RadioGroup>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigateToUrl(`${APP_BASE_URL}/token`)}
                    >
                      Tokens
                    </DropdownMenuItem>
                    {currentUser.admin && (
                      <DropdownMenuItem
                        onClick={() => navigateToUrl(`${APP_BASE_URL}/admin`)}
                      >
                        Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="leading-5 text-sign-out-foreground data-[highlighted]:text-sign-out-foreground"
                      onClick={() => navigateToUrl(`${APP_BASE_URL}/logout`)}
                    >
                      <LogOut className="size-4 shrink-0" aria-hidden="true" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            ) : null}
          </MenuBarActions>
        </NavigationMenu>

        <Sidebar
          data-testid="nav-drawer"
          aria-label="Main"
          className="fixed left-0 top-[calc(3.5rem_+_var(--top-banner-height,0px))] z-30 h-[calc(100%_-_3.5rem_-_var(--top-banner-height,0px)_-_var(--bottom-banner-height,0px))] rounded-none border-r border-sidebar-border max-sm:hidden"
        >
          {sidebarContent}
        </Sidebar>

        <Drawer
          side="left"
          open={mobileDrawerOpen}
          onOpenChange={setMobileDrawerOpen}
        >
          <DrawerContent
            data-testid="nav-drawer-mobile"
            className="data-[swipe-axis=x]:[--drawer-content-width:16rem]"
          >
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="p-0">
              <nav aria-label="Main">{sidebarContent}</nav>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </SidebarProvider>
  );
};

// A single segment of the light/dark/system control. A menu *radio* item
// (role="menuitemradio" + aria-checked) that only looks like a segmented
// control — see the nebari-ui header recipe for why tabs would be the wrong
// semantics here.
const ThemeOption = ({
  value,
  label,
  text,
  children,
}: {
  value: ThemeMode;
  label: string;
  text: string;
  children: React.ReactNode;
}): React.ReactElement => (
  <MenuPrimitive.RadioItem
    value={value}
    aria-label={label}
    title={label}
    // Keep the menu open after switching so the change is immediately visible.
    closeOnClick={false}
    className={cn(
      'flex h-auto flex-1 cursor-pointer items-center justify-center gap-1 rounded-sm border border-transparent px-1.5 py-0.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'text-muted-foreground-strong hover:text-foreground',
      'data-checked:border-border-strong data-checked:bg-card data-checked:text-foreground data-checked:shadow-[0_1px_3px_0_rgba(0,0,0,0.10)]',
    )}
  >
    {children}
    <span>{text}</span>
  </MenuPrimitive.RadioItem>
);

export default TopNavigation;
