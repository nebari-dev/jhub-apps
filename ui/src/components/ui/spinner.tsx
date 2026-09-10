import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle, type LucideProps } from 'lucide-react';

const spinnerVariants = cva('animate-spin', {
  variants: {
    // `default` intentionally adds no `size-*` class: standalone it falls back
    // to lucide's own size, and inside `Button` it lets the button's
    // `[&_svg:not([class*='size-'])]:size-*` rule size the spinner per button
    // size. The explicit sizes are for standalone use.
    size: {
      xs: 'size-3.5',
      sm: 'size-4',
      default: '',
      lg: 'size-6',
      xl: 'size-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type SpinnerProps = Omit<LucideProps, 'size'> &
  VariantProps<typeof spinnerVariants> & {
    /**
     * Accessible label announced by assistive tech. Defaults to `"Loading"`.
     */
    label?: string;
  };

/**
 * Minimal loading spinner — an `animate-spin` wrapper around lucide's
 * `LoaderCircle`. Exposes `role="status"` so assistive tech announces it and
 * tests can query it. Used by `Button`'s `loading` state.
 */
function Spinner({
  className,
  size,
  label = 'Loading',
  ...props
}: SpinnerProps) {
  return (
    <LoaderCircle
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      data-size={size ?? 'default'}
      data-slot="spinner"
      role="status"
      {...props}
    />
  );
}

export type { SpinnerProps };
export { Spinner, spinnerVariants };
