import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from 'src/lib/utils';

// Variants map the MUI theme matrix (contained|outlined|text × primary|secondary|destructive).
// Tailwind tokens (primary/secondary/destructive/accent) are wired to the brand palette in index.css.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // contained × primary
        default:
          'bg-primary text-primary-foreground font-bold hover:bg-brand-purple-dark',
        // contained × secondary
        secondary:
          'bg-secondary text-secondary-foreground font-semibold border border-secondary hover:bg-gray-300 hover:border-gray-300',
        // contained × destructive (error)
        destructive:
          'bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90',
        // outlined × primary
        outline:
          'bg-background text-primary border-2 border-primary font-bold hover:bg-background',
        // outlined × secondary (green)
        'outline-secondary':
          'bg-background text-brand-green border-2 border-brand-green font-bold hover:bg-background',
        // text × primary
        ghost: 'text-primary hover:bg-accent focus:bg-accent',
        // text × secondary (neutral)
        'ghost-secondary': 'text-brand-black hover:bg-gray-50 focus:bg-gray-50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
