import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@src/components/ui/sheet';
import { useColorMode } from '@src/hooks/use-color-mode';
import { useMediaQuery } from '@src/hooks/use-media-query';
import { cn } from '@src/lib/utils';
import type { ServersData } from '@src/types/api';
import type { JhApp, JhService, JhServiceFull } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { type ColorMode, isColorMode } from '@src/utils/color-mode';
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [services, setServices] = useState<JhService[]>([]);
  const [pinnedApps, setPinnedApps] = useState<JhApp[]>([]);
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const { colorMode, isDark, setColorMode } = useColorMode();

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
      setMobileSheetOpen(false);
    }
  }, [isMobileBreakpoint]);

  const drawerContent = (
    <div>
      <ul className="m-0 list-none p-0 pb-4">
        <li className="mt-4">
          <button
            type="button"
            onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
            className="relative mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center rounded-lg border-0 bg-[var(--primary-color-light,#BA18DA10)] px-6 py-2 text-left before:absolute before:bottom-0 before:left-0 before:top-0 before:w-2 before:rounded-l-lg before:bg-[var(--primary-color,#BA18DA)] before:content-[''] hover:bg-muted"
          >
            <HomeIcon className="mr-2 h-6 w-6 text-foreground" />
            <span className="relative top-[2px] text-sm font-medium leading-tight">
              Home
            </span>
          </button>
        </li>
      </ul>
      <ul className="m-0 list-none px-1 py-0">
        <li>
          <p className="m-0 px-6 py-1 text-sm font-semibold uppercase text-muted-foreground">
            Services
          </p>
        </li>
        {pinnedApps.map((item) => (
          <li key={`pinned-${item.name}`}>
            <a
              href={item.url}
              className="block w-full rounded px-6 py-2 text-sm text-foreground no-underline hover:bg-muted hover:no-underline"
            >
              {item.name}
            </a>
          </li>
        ))}
        {services.map((item) => (
          <li key={`service-${item.name}`}>
            <a
              href={item.url}
              className="block w-full rounded px-6 py-2 text-sm text-foreground no-underline hover:bg-muted hover:no-underline"
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div hidden={isHeadless}>
      <header
        id="app-bar"
        className="fixed inset-x-0 top-0 z-[1201] bg-navbar shadow-md dark:border-b dark:border-border dark:bg-card dark:shadow-none"
      >
        <div
          id="toolbar"
          className="flex min-h-16 items-center gap-2 px-4 sm:px-6"
        >
          <button
            type="button"
            aria-label="open drawer"
            onClick={() => setMobileSheetOpen((prev) => !prev)}
            className="mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-navbar-foreground hover:bg-muted dark:text-foreground sm:!hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="max-sm:hidden flex-grow">
            <a href={APP_BASE_URL}>
              <img
                id="app-logo"
                src={getAppLogoUrl(isDark)}
                alt="logo"
                // In dark mode the default logo swaps to its white-text variant
                // (like the landing page). If a custom/branded logo has no such
                // variant, the URL is unchanged — fall back to monochrome-white
                // so it stays legible on the dark navbar.
                className={cn(
                  'h-7 w-auto',
                  isDark &&
                    getAppLogoUrl(isDark) === getAppLogoUrl(false) &&
                    'brightness-0 invert',
                )}
              />
            </a>
          </div>
          <div className="max-sm:hidden">
            <DropdownMenu
              open={profileMenuOpen}
              onOpenChange={setProfileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  id="profile-menu-btn"
                  variant="ghost"
                  className="button-menu bg-transparent font-bold text-navbar-foreground hover:bg-muted focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-foreground"
                  aria-haspopup="true"
                >
                  {currentUser?.name}{' '}
                  {currentUser?.admin && (
                    <Badge
                      variant="secondary"
                      className="chip ml-2 bg-secondary text-secondary-foreground dark:border-border"
                    >
                      admin
                    </Badge>
                  )}
                  {profileMenuOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                id="profile-menu-list"
                align="end"
                sideOffset={12}
                className="w-72"
              >
                <div className="px-2 py-1.5">
                  <DropdownMenuRadioGroup
                    aria-label="Theme"
                    value={colorMode}
                    onValueChange={(value) => {
                      if (isColorMode(value)) {
                        setColorMode(value);
                      }
                    }}
                    className="flex items-center gap-1 rounded-lg bg-muted p-1"
                  >
                    <ThemeOption value="light" label="Light mode" text="Light">
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
                  </DropdownMenuRadioGroup>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => navigateToUrl(`${APP_BASE_URL}/token`)}
                >
                  Tokens
                </DropdownMenuItem>
                {currentUser?.admin && (
                  <DropdownMenuItem
                    onSelect={() => navigateToUrl(`${APP_BASE_URL}/admin`)}
                  >
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => navigateToUrl(`${APP_BASE_URL}/logout`)}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <nav>
        <aside
          data-testid="nav-drawer"
          className={cn(
            'fixed left-0 top-16 z-[1200] h-[calc(100%-4rem)] w-56 border-r border-border bg-background shadow max-sm:hidden',
          )}
        >
          {drawerContent}
        </aside>
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent
            side="left"
            className="w-56 p-0 sm:!hidden"
            data-testid="nav-drawer-mobile"
          >
            {drawerContent}
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

// A single segment of the light/dark/system control. Uses the raw Radix radio
// item so the group renders as a compact segmented toggle (matching the Nebari
// landing page) rather than the standard checkmark-style menu radio item.
const ThemeOption = ({
  value,
  label,
  text,
  children,
}: {
  value: ColorMode;
  label: string;
  text: string;
  children: React.ReactNode;
}): React.ReactElement => (
  <DropdownMenuPrimitive.RadioItem
    value={value}
    aria-label={label}
    title={label}
    // Keep the menu open after switching so the change is immediately visible.
    onSelect={(event) => event.preventDefault()}
    className={cn(
      'flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'text-muted-foreground hover:text-foreground',
      'data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm',
    )}
  >
    {children}
    <span>{text}</span>
  </DropdownMenuPrimitive.RadioItem>
);

export default TopNavigation;
