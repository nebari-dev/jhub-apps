import { Input, type InputProps } from '@src/components/ui/input';
import { cn } from '@src/lib/utils';
import type * as React from 'react';

// App-owned wrapper that composes the @nebari/input primitive with optional
// leading / trailing icons. Extends at the call site rather than editing the
// managed input.tsx.
export interface InputWithIconProps extends InputProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

function InputWithIcon({
  className,
  containerClassName,
  startIcon,
  endIcon,
  ...props
}: InputWithIconProps) {
  return (
    <div className={cn('relative w-full', containerClassName)}>
      {startIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground [&_svg]:size-4">
          {startIcon}
        </span>
      ) : null}
      <Input
        className={cn(startIcon && 'pl-9', endIcon && 'pr-9', className)}
        {...props}
      />
      {endIcon ? (
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground [&_svg]:size-4">
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

export { InputWithIcon };
