import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Button, type ButtonProps } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronRightIcon, ChevronsUpDownIcon } from 'lucide-react';
import type * as React from 'react';

const dropdownMenuItemVariants = cva(
  'relative flex w-full cursor-default items-center gap-2 rounded-[calc(var(--radius-md)-var(--spacing))] px-1.5 py-1 text-sm outline-hidden select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-[color,background-color] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'text-destructive-foreground data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const dropdownMenuTriggerVariants = cva('group data-[popup-open]:underline', {
  variants: {
    variant: {
      default:
        'bg-muted text-foreground shadow-none hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground',
      destructive: '',
      outline: '',
      secondary: '',
      ghost: '',
      link: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props &
  Omit<ButtonProps, keyof MenuPrimitive.Trigger.Props | 'size'> & {
    variant?: NonNullable<ButtonProps['variant']>;
    showExpandIcon?: boolean;
    expandIcon?: React.ReactNode;
  };

type DropdownMenuProps = MenuPrimitive.Root.Props;

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

type DropdownMenuItemProps = MenuPrimitive.Item.Props &
  VariantProps<typeof dropdownMenuItemVariants>;

type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props &
  VariantProps<typeof dropdownMenuItemVariants>;

interface DropdownMenuSubmenuProps
  extends Omit<MenuPrimitive.SubmenuRoot.Props, 'children'> {
  children?: React.ReactNode;
  label: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  variant?: NonNullable<
    VariantProps<typeof dropdownMenuItemVariants>['variant']
  >;
}

const DropdownMenuPortal = MenuPrimitive.Portal;

/** Groups menu open state and sub-parts for trigger/content composition. */
function DropdownMenu({
  children,
  ...props
}: Omit<DropdownMenuProps, 'children'> & {
  children?: React.ReactNode;
}) {
  return (
    <MenuPrimitive.Root {...props}>
      {children ?? <span data-slot="dropdown-menu" hidden />}
    </MenuPrimitive.Root>
  );
}

/** Trigger element that opens the menu, with optional text-only styling and icon. */
function DropdownMenuTrigger({
  className,
  children,
  variant,
  showExpandIcon = false,
  expandIcon,
  ...props
}: DropdownMenuTriggerProps) {
  const buttonVariant = variant ?? 'default';

  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      data-variant={buttonVariant}
      render={<Button size="default" variant={buttonVariant} />}
      className={cn(
        dropdownMenuTriggerVariants({ variant: buttonVariant }),
        showExpandIcon && 'gap-1.5',
        className,
      )}
      {...props}
    >
      {children}
      {showExpandIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none inline-flex items-center"
          data-slot="dropdown-menu-trigger-icon"
        >
          {expandIcon ?? <ChevronsUpDownIcon className="size-4" />}
        </span>
      )}
    </MenuPrimitive.Trigger>
  );
}

/** Groups related menu items under a shared label and semantics. */
function DropdownMenuGroup({ className, ...props }: MenuPrimitive.Group.Props) {
  return (
    <MenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

/** Portaled popup surface positioned against the trigger. */
function DropdownMenuContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      className="isolate z-50"
      side={side}
      sideOffset={sideOffset}
    >
      <MenuPrimitive.Popup
        data-slot="dropdown-menu-content"
        className={cn(
          'z-50 min-w-60 origin-(--transform-origin) rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-base) motion-safe:ease-(--ease-emphasized)',
          className,
        )}
        {...props}
      >
        {children}
      </MenuPrimitive.Popup>
    </MenuPrimitive.Positioner>
  );
}

/** Standard actionable menu item with optional destructive emphasis. */
function DropdownMenuItem({
  className,
  children,
  variant,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant ?? 'default'}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
      {...props}
    >
      {children}
    </MenuPrimitive.Item>
  );
}

/** Visual divider between menu groups. */
function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/** Non-interactive uppercase label for a grouped section. */
function DropdownMenuGroupLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-group-label"
      className={cn(
        'px-2 py-1.5 text-[11px] leading-4 font-medium tracking-[0.8px] text-muted-foreground uppercase',
        className,
      )}
      {...props}
    />
  );
}

/** Toggleable menu item with trailing check indicator. */
function DropdownMenuCheckboxItem({
  className,
  children,
  variant,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-variant={variant ?? 'default'}
      className={cn(dropdownMenuItemVariants({ variant }), 'pr-7', className)}
      {...props}
    >
      <span className="flex flex-1 items-center">{children}</span>
      <MenuPrimitive.CheckboxItemIndicator
        className="pointer-events-none absolute right-1.5 inline-flex size-4 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <CheckIcon className="size-4" />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

/** Nested submenu with its own popup and right-chevron trigger. */
function DropdownMenuSubmenu({
  children,
  contentClassName,
  label,
  triggerClassName,
  variant = 'default',
  ...props
}: DropdownMenuSubmenuProps) {
  return (
    <MenuPrimitive.SubmenuRoot {...props}>
      <MenuPrimitive.SubmenuTrigger
        data-slot="dropdown-menu-submenu-trigger"
        data-variant={variant}
        className={cn(
          dropdownMenuItemVariants({ variant }),
          'pr-7',
          triggerClassName,
        )}
      >
        <span className="flex flex-1 items-center">{label}</span>
        <ChevronRightIcon className="absolute right-1.5 size-4" />
      </MenuPrimitive.SubmenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          className={contentClassName}
          side="right"
          sideOffset={8}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </MenuPrimitive.SubmenuRoot>
  );
}

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
  DropdownMenuSubmenuProps,
  DropdownMenuTriggerProps,
};
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuTrigger,
  dropdownMenuItemVariants,
  dropdownMenuTriggerVariants,
};
