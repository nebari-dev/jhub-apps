import { useRender } from '@base-ui/react/use-render';
import {
  DropdownMenu,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  type DropdownMenuProps,
  DropdownMenuTrigger,
  type DropdownMenuTriggerProps,
} from '@src/components/ui/dropdown-menu';
import { cn } from '@src/lib/utils';
import { cva } from 'class-variance-authority';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

type NavLinkProps = useRender.ComponentProps<'a'> & {
  /** Marks the link as the current page or section. */
  active?: boolean;
  /** Optional icon rendered before the label or as the only visible content. */
  icon?: ReactNode;
  /** Removes the link from interaction and applies the muted disabled style. */
  disabled?: boolean;
};

type NavDropdownMenuProps = Omit<DropdownMenuProps, 'children'> & {
  /** Content rendered inside the dropdown trigger. */
  trigger: ReactNode;
  /** Dropdown menu items. */
  children: ReactNode;
  /** Marks the trigger as the current page or section. */
  active?: boolean;
  /** Removes the trigger from interaction and applies the muted disabled style. */
  disabled?: boolean;
  /** Optional icon rendered before the trigger content. */
  icon?: ReactNode;
  /** Classes applied to the dropdown trigger. */
  triggerClassName?: string;
  /** Additional props applied to the dropdown trigger. */
  triggerProps?: Omit<
    DropdownMenuTriggerProps,
    'children' | 'className' | 'disabled' | 'variant'
  >;
  /** Classes applied to the dropdown content. */
  contentClassName?: string;
  /** Positioning options forwarded to the dropdown content. */
  contentProps?: Omit<DropdownMenuContentProps, 'children' | 'className'>;
};

type MenuBarProps = ComponentProps<'header'>;
type MenuBarBrandProps = ComponentProps<'a'>;
type MenuBarNavProps = ComponentProps<'nav'>;
type MenuBarActionsProps = ComponentProps<'div'>;

/**
 * Shared styles for application-level navigation links and dropdown triggers.
 */
const navLinkVariants = cva(
  'relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 font-medium text-foreground text-sm underline-offset-4 outline-none hover:bg-muted hover:underline focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:after:absolute data-[active=true]:after:right-2 data-[active=true]:after:bottom-0 data-[active=true]:after:left-2 data-[active=true]:after:h-0.5 data-[active=true]:after:bg-primary data-[active=true]:after:content-[""] data-[disabled]:pointer-events-none data-[disabled]:bg-muted/50 data-[disabled]:text-muted-foreground-strong data-[disabled]:no-underline motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) motion-safe:active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
);

/**
 * Application navigation link. It renders an anchor by default and supports
 * Base UI's `render` prop for framework router links.
 */
function NavLink({
  active = false,
  children,
  className,
  disabled = false,
  icon,
  onClick,
  ref,
  render = <a href="/">{children}</a>,
  tabIndex,
  ...props
}: NavLinkProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (disabled || active) {
      event.preventDefault();
      return;
    }

    onClick?.(event as MouseEvent<HTMLAnchorElement>);
  }

  return useRender({
    render,
    ref,
    props: {
      ...props,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      children: (
        <>
          {icon}
          {children !== undefined && children !== null ? (
            <span>{children}</span>
          ) : null}
        </>
      ),
      className: cn(navLinkVariants(), className),
      'data-active': active ? 'true' : undefined,
      'data-disabled': disabled ? 'true' : undefined,
      'data-slot': 'nav-link',
      onClick: handleClick,
      tabIndex: disabled ? -1 : tabIndex,
    },
  });
}

/**
 * Navbar dropdown composed from the shared DropdownMenu component. Consumers
 * provide DropdownMenuItem children and choose link or click behavior on each
 * item directly.
 */
function NavDropdownMenu({
  active = false,
  children,
  contentClassName,
  contentProps,
  disabled = false,
  icon,
  trigger,
  triggerClassName,
  triggerProps,
  ...props
}: NavDropdownMenuProps) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        {...triggerProps}
        aria-current={active ? 'page' : undefined}
        className={cn(navLinkVariants(), triggerClassName)}
        data-active={active ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-slot="nav-dropdown-menu-trigger"
        disabled={disabled}
        showExpandIcon={triggerProps?.showExpandIcon ?? true}
        variant="ghost"
      >
        {icon}
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          {...contentProps}
          className={contentClassName}
          data-slot="nav-dropdown-menu-content"
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

/**
 * Full-width application navigation bar with brand, center navigation, and
 * right-side action slots.
 */
function MenuBar({ className, ...props }: MenuBarProps) {
  return (
    <header
      data-slot="menu-bar"
      className={cn(
        'flex h-12 w-full items-center gap-3 border-border border-b bg-card px-3 text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}

const NavigationMenu = MenuBar;

/** Brand link for the left side of a MenuBar. */
function MenuBarBrand({ className, ...props }: MenuBarBrandProps) {
  return (
    <a
      data-slot="menu-bar-brand"
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-md font-bold text-2xl text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
}

/** Center navigation slot for links and dropdown menus. */
function MenuBarNav({ className, ...props }: MenuBarNavProps) {
  return (
    <nav
      data-slot="menu-bar-nav"
      className={cn('flex min-w-0 flex-1 items-center gap-1', className)}
      {...props}
    />
  );
}

/** Right-side action slot for notifications, settings, and account controls. */
function MenuBarActions({ className, ...props }: MenuBarActionsProps) {
  return (
    <div
      data-slot="menu-bar-actions"
      className={cn('ml-auto flex shrink-0 items-center gap-1.5', className)}
      {...props}
    />
  );
}

export type {
  MenuBarActionsProps,
  MenuBarBrandProps,
  MenuBarNavProps,
  MenuBarProps,
  NavDropdownMenuProps,
  NavLinkProps,
};
export {
  MenuBar,
  MenuBarActions,
  MenuBarBrand,
  MenuBarNav,
  NavDropdownMenu,
  NavigationMenu,
  NavLink,
  navLinkVariants,
};
