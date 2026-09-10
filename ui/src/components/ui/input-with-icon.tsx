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
      {/* z-10 keeps the icons above the input. The @nebari input renders its own
          relative wrapper (for the invalid-state icon), and as a positioned
          sibling that comes later in DOM order it would otherwise paint over
          these spans -- the input's own background hiding the icon entirely. */}
      {startIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground [&_svg]:size-4">
          {startIcon}
        </span>
      ) : null}
      <Input
        className={cn(startIcon && 'pl-9', endIcon && 'pr-9', className)}
        {...props}
      />
      {endIcon ? (
        <span className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-muted-foreground [&_svg]:size-4">
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

export { InputWithIcon };
