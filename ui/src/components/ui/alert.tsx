import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

const alertVariants = cva(
  // CSS-grid layout from the Figma frame: an optional 16px icon column and a
  // 1fr content column. With no leading `svg` the icon column collapses to 0 so
  // the content sits flush left. A leading icon is auto-placed in column 1 and
  // nudged down half a line to align with the title's cap height. An
  // `AlertAction` floats in the top-right corner, so reserve trailing space for
  // it whenever one is present.
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-md border p-2 text-sm has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-2 has-data-[slot=alert-action]:pr-18 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      // Maps onto the Figma `Alert` variant set. `default` is the neutral card
      // style and also carries informational messages; `destructive` doubles as
      // the "error" state. Colored variants (success, warning, destructive)
      // paint title, description, icon, and border with the same foreground
      // token; only `default` mutes its description.
      variant: {
        default:
          'border-border bg-card text-foreground *:data-[slot=alert-description]:text-muted-foreground',
        success: 'border-success-foreground bg-success text-success-foreground',
        warning: 'border-warning-foreground bg-warning text-warning-foreground',
        destructive:
          'border-destructive-foreground bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants>;

// Map severity onto the ARIA live-region role. `alert` (assertive) interrupts
// the screen reader immediately and is reserved for variants that demand
// attention — `warning`/`destructive`. The calmer `success`/`default`
// variants use `status` (polite) so they're announced without cutting off
// whatever the user is doing. Callers can override with an explicit `role`.
const alertRoleForVariant: Record<
  NonNullable<AlertProps['variant']>,
  'alert' | 'status'
> = {
  default: 'status',
  success: 'status',
  warning: 'alert',
  destructive: 'alert',
};

/**
 * Alert surfaces an inline, non-blocking status message, implemented from the
 * Nebari Figma `Alert` variant set. Compose it with {@link AlertTitle},
 * {@link AlertDescription}, and an optional {@link AlertAction}; drop a
 * `lucide-react` icon as the first child to get the leading-icon layout. The
 * root is a live region — `role="alert"` (assertive) for `warning`/`destructive`
 * and `role="status"` (polite) otherwise — overridable via the `role` prop.
 */
function Alert({ className, variant, role, ...props }: AlertProps) {
  return (
    <div
      role={role ?? alertRoleForVariant[variant ?? 'default']}
      data-slot="alert"
      data-variant={variant ?? 'default'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 font-medium', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Action slot pinned to the top-right corner of the {@link Alert} — typically a
 * dismiss icon button or a short action button. The root reserves trailing
 * padding whenever an `AlertAction` is present so it never overlaps the content.
 */
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-2 right-2', className)}
      {...props}
    />
  );
}

export type { AlertProps };
export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
