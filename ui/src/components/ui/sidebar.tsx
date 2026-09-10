import { useRender } from '@base-ui/react/use-render';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type SidebarState = 'expanded' | 'collapsed';

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((previous: boolean) => boolean)) => void;
  state: SidebarState;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  state: 'expanded',
  toggle: () => {},
});

type SidebarProviderProps = {
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

function SidebarProvider({
  children,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
}: SidebarProviderProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);

  const collapsed = collapsedProp ?? uncontrolledCollapsed;

  const setCollapsed = useCallback(
    (next: boolean | ((previous: boolean) => boolean)) => {
      const nextCollapsed = typeof next === 'function' ? next(collapsed) : next;

      if (collapsedProp === undefined) {
        setUncontrolledCollapsed(nextCollapsed);
      }

      onCollapsedChange?.(nextCollapsed);
    },
    [collapsed, collapsedProp, onCollapsedChange],
  );

  const toggle = useCallback(() => {
    setCollapsed((previous) => !previous);
  }, [setCollapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      state: collapsed ? 'collapsed' : 'expanded',
      toggle,
    }),
    [collapsed, setCollapsed, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  return useContext(SidebarContext);
}

const sidebarVariants = cva(
  'group/sidebar flex h-full shrink-0 flex-col overflow-hidden rounded-lg bg-sidebar text-sidebar-foreground data-[state=collapsed]:w-16 data-[state=expanded]:w-64 motion-safe:transition-[width] motion-safe:duration-[var(--duration-slow)] motion-safe:ease-[var(--ease-emphasized)]',
  {
    variants: {
      variant: {
        default: '',
        inset: 'shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type SidebarProps = ComponentProps<'nav'> &
  VariantProps<typeof sidebarVariants>;

function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { state } = useSidebar();

  return (
    <nav
      className={cn(sidebarVariants({ variant }), className)}
      data-slot="sidebar"
      data-state={state}
      data-variant={variant ?? 'default'}
      {...props}
    />
  );
}

type SidebarTriggerProps = useRender.ComponentProps<'button'>;

function SidebarTrigger({
  className,
  onClick,
  ref,
  render = <button type="button" />,
  ...props
}: SidebarTriggerProps) {
  const { state, toggle } = useSidebar();

  return useRender({
    render,
    ref,
    props: {
      'aria-expanded': state === 'expanded',
      'aria-label':
        state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar',
      children: <PanelLeft className="size-5" />,
      className: cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-sidebar hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[color,background-color] motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-standard)]',
        className,
      ),
      'data-slot': 'sidebar-trigger',
      'data-state': state,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          toggle();
        }
      },
      ...props,
    },
  });
}

function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full items-center gap-2 p-2', className)}
      data-slot="sidebar-header"
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-2',
        className,
      )}
      data-slot="sidebar-content"
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-auto w-full bg-muted p-2', className)}
      data-slot="sidebar-footer"
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col', className)}
      data-slot="sidebar-group"
      {...props}
    />
  );
}

function SidebarGroupLabel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex h-6 items-center rounded-sm px-2 py-1 text-[11px] font-medium tracking-[0.3px] text-muted-foreground-strong uppercase group-data-[state=collapsed]/sidebar:opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-standard)]',
        className,
      )}
      data-slot="sidebar-group-label"
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('m-0 flex list-none flex-col gap-0.5 p-0', className)}
      data-slot="sidebar-menu"
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn('m-0 p-0', className)}
      data-slot="sidebar-menu-item"
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'inline-flex w-full items-center gap-2 rounded-lg px-4 text-left text-foreground outline-none hover:[&_[data-slot=sidebar-menu-label]]:underline data-[active=true]:font-semibold focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:pointer-events-none disabled:text-muted-foreground motion-safe:transition-[color,background-color] motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-standard)] group-data-[state=collapsed]/sidebar:gap-0 group-data-[state=collapsed]/sidebar:overflow-hidden group-data-[state=collapsed]/sidebar:[&_[data-slot=sidebar-menu-trailing]]:hidden',
  {
    variants: {
      variant: {
        default:
          'hover:bg-muted data-[active=true]:bg-muted data-[active=true]:text-foreground',
        ghost:
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      },
      size: {
        default: 'h-8 py-1',
        sm: 'h-7 py-1 text-sm',
        lg: 'h-9 py-1.5',
        account: 'h-12 px-2 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type SidebarMenuButtonProps = useRender.ComponentProps<'button'> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    active?: boolean;
    tooltip?: ReactNode;
  };

function SidebarMenuButton({
  active = false,
  className,
  ref,
  render = <button type="button" />,
  size,
  tooltip,
  variant,
  ...props
}: SidebarMenuButtonProps) {
  const { state } = useSidebar();
  const button = useRender({
    render,
    ref,
    props: {
      'aria-current': active ? 'page' : undefined,
      className: cn(sidebarMenuButtonVariants({ size, variant }), className),
      'data-active': active || undefined,
      'data-size': size ?? 'default',
      'data-slot': 'sidebar-menu-button',
      'data-variant': variant ?? 'default',
      ...props,
    },
  });

  if (tooltip === undefined) {
    return button;
  }

  return (
    <Tooltip disabled={state === 'expanded'}>
      <TooltipTrigger data-slot="sidebar-menu-button" render={button} />
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function SidebarMenuLabel({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-standard)]',
        className,
      )}
      data-slot="sidebar-menu-label"
      {...props}
    />
  );
}

function SidebarMenuDescription({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'block truncate text-xs leading-4 text-muted-foreground-strong group-data-[state=collapsed]/sidebar:opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-standard)]',
        className,
      )}
      data-slot="sidebar-menu-description"
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn(
        'm-0 my-0.5 ml-4 flex list-none flex-col gap-0 border-l border-sidebar-border pl-4 group-data-[state=collapsed]/sidebar:hidden',
        className,
      )}
      data-slot="sidebar-menu-sub"
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn('m-0 p-0', className)}
      data-slot="sidebar-menu-sub-item"
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: ComponentProps<'hr'>) {
  return (
    <hr
      className={cn('my-2 border-t border-sidebar-border', className)}
      data-slot="sidebar-separator"
      {...props}
    />
  );
}

export type {
  SidebarMenuButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarState,
  SidebarTriggerProps,
};
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuDescription,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  sidebarVariants,
  useSidebar,
};
