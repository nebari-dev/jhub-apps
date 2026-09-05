import { useRender } from '@base-ui/react/use-render';
import { Spinner } from '@src/components/ui/spinner';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Children, isValidElement, type ReactNode } from 'react';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium underline-offset-4 outline-none motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) motion-safe:active:scale-[0.97] hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:no-underline data-[disabled]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // Disabled and loading collapse to a muted look (Figma): the component
      // sets `data-disabled` whenever `disabled || loading`, so both states
      // share these `data-[disabled]:*` overrides and loading also shows a Spinner.
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-hover data-[disabled]:bg-muted',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground hover:border-destructive-foreground active:border-destructive-foreground data-[disabled]:border-transparent data-[disabled]:bg-muted',
        outline:
          'border border-input bg-background shadow-xs hover:border-muted-foreground hover:bg-accent hover:text-accent-foreground active:border-muted-foreground active:bg-accent active:text-accent-foreground data-[disabled]:border-border data-[disabled]:bg-transparent',
        secondary:
          'border border-transparent bg-secondary text-secondary-foreground shadow-xs hover:border-input active:border-input data-[disabled]:border-transparent data-[disabled]:bg-muted',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground',
        link: 'text-foreground',
      },
      size: {
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: 'h-8 px-3 text-sm',
        lg: 'h-9 px-4 text-sm',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        icon: 'size-8 text-sm',
        'icon-lg': 'size-9 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = useRender.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Renders a {@link Spinner}, sets `aria-busy`, and disables the button
     * while an async action is in flight. The Spinner replaces the leading
     * icon (or the whole content, for icon-only sizes).
     */
    loading?: boolean;
    /**
     * Optional label shown beside the Spinner while `loading`, replacing the
     * button's normal content (e.g. `loadingText="Saving…"`). Ignored for
     * icon-only sizes.
     */
    loadingText?: ReactNode;
  };

/**
 * Button implemented from the Nebari Figma spec. Variants and sizes are driven
 * by `class-variance-authority`; polymorphism is provided by Base UI's `render`
 * prop, so a `Button` can become a link or any other element while keeping its
 * styling (`<Button render={<a href="…" />}>`).
 */
function Button({
  className,
  variant,
  size,
  loading = false,
  loadingText,
  disabled,
  children,
  ref,
  render = <button type="button" />,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isIconSize = size?.startsWith('icon') ?? false;

  // While loading the Spinner takes the place of the leading icon. Icon-only
  // buttons show just the Spinner; otherwise it sits before the remaining
  // content, and `loadingText` (when given) replaces that content entirely.
  let content: ReactNode = children;
  if (loading) {
    if (isIconSize) {
      content = <Spinner />;
    } else if (loadingText !== undefined) {
      content = (
        <>
          <Spinner />
          {loadingText}
        </>
      );
    } else {
      const items = Children.toArray(children);
      const hasLeadingIcon = items.length > 0 && isValidElement(items[0]);
      content = (
        <>
          <Spinner />
          {hasLeadingIcon ? items.slice(1) : items}
        </>
      );
    }
  }

  return useRender({
    render,
    ref,
    props: {
      className: cn(buttonVariants({ variant, size }), className),
      'data-slot': 'button',
      'data-variant': variant ?? 'default',
      'data-size': size ?? 'default',
      'data-disabled': isDisabled || undefined,
      disabled: isDisabled,
      'aria-busy': loading || undefined,
      'aria-disabled': isDisabled || undefined,
      children: content,
      ...props,
    },
  });
}

export type { ButtonProps };
export { Button, buttonVariants };
