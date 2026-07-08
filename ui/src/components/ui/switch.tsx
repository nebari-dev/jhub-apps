'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@src/lib/utils';
import * as React from 'react';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer relative box-border inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-solid border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none absolute top-0 block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-[left] data-[state=checked]:left-5 data-[state=unchecked]:left-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
