import { useRender } from '@base-ui/react/use-render';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  // Interaction cues (hover underline, hover/active fill) are scoped to when the
  // badge is actually rendered as a link or button (`[a&]` / `[button&]`); a
  // plain status/label chip stays static. `underline-offset-2` + the wider `px-2`
  // padding keep the hover underline inside the chip's bounds.
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 font-medium text-xs leading-4 underline-offset-2 outline-none transition-colors [a&]:hover:underline [button&]:hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground [a&]:hover:bg-primary-hover [a&]:active:bg-primary-hover [button&]:hover:bg-primary-hover [button&]:active:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-border-strong bg-background text-foreground',
        ghost: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps
  extends useRender.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge implemented from the Nebari Figma spec — a small status/label chip.
 * Variants are driven by `class-variance-authority`; polymorphism is provided
 * by Base UI's `render` prop, so a `Badge` can become a link (or any element)
 * while keeping its styling (`<Badge render={<a href="…" />}>`).
 */
function Badge({
  className,
  variant,
  ref,
  render = <span />,
  ...props
}: BadgeProps) {
  return useRender({
    render,
    ref,
    props: {
      className: cn(badgeVariants({ variant }), className),
      'data-slot': 'badge',
      'data-variant': variant ?? 'default',
      ...props,
    },
  });
}

export type { BadgeProps };
export { Badge, badgeVariants };
