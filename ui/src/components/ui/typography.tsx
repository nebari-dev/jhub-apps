import { cn } from '@src/lib/utils';
import * as React from 'react';

// Class-string map ported from ui/src/theme/theme.tsx so MUI <Typography variant="…">
// can be swapped for <Text variant="…"> (or `className={typographyVariants.h5}`)
// during the MUI -> shadcn migration. Sizes + letter-spacing + padding-bottom
// preserve visual parity with the existing MUI theme.
export const typographyVariants = {
  h1: 'text-8xl tracking-[-1.5px]',
  h2: 'text-6xl tracking-[0.5px]',
  h3: 'text-5xl tracking-normal',
  h4: 'text-[34px] tracking-[0.25px]',
  h5: 'text-2xl font-semibold tracking-normal pb-4',
  h6: 'text-xl font-bold tracking-[0.15px] pb-4',
  subtitle1: 'text-base font-semibold tracking-[0.15px] pb-6',
  subtitle2: 'text-sm font-medium tracking-[0.1px] pb-6',
  body1: 'text-base tracking-[0.15px]',
  body2: 'text-sm tracking-[0.17px]',
  caption: 'text-xs tracking-[0.4px]',
  overline: 'text-xs tracking-[1px] uppercase',
} as const;

export type TypographyVariant = keyof typeof typographyVariants;

const variantElement: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body1', as, className, ...props }, ref) => {
    const Comp = as ?? variantElement[variant];
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants[variant], className)}
        {...props}
      />
    );
  },
);
Text.displayName = 'Text';
