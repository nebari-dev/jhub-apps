import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

const cardVariants = cva(
  'group/card flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground text-sm shadow-xs has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-md *:[img:last-child]:rounded-b-md',
  {
    variants: {
      size: {
        default:
          'gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(5)]',
        sm: 'gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants>;

/**
 * Card is a static surface for grouping related content and actions. The root
 * owns the shared `--card-spacing` value used by header, content, and footer;
 * set `size="sm"` for a more compact card or override the spacing with an
 * arbitrary property class such as `[--card-spacing:--spacing(6)]`.
 */
function Card({ className, size, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size ?? 'default'}
      className={cn(cardVariants({ size }), className)}
      {...props}
    />
  );
}

/** Header region for a card title, description, and optional action. */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

/** Primary heading for a card. */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-medium text-base leading-6', className)}
      {...props}
    />
  );
}

/** Supporting text that describes the card title or content. */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm leading-5', className)}
      {...props}
    />
  );
}

/** Action slot placed in the upper-right of {@link CardHeader}. */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

/** Main body area for card content. */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-(--card-spacing)', className)}
      {...props}
    />
  );
}

/** Footer area for actions or secondary card content. */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center gap-2 px-(--card-spacing) [.border-t]:pt-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

export type { CardProps };
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
