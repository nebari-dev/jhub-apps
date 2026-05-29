import { Input } from '@src/components/ui/input';
import { cn } from '@src/lib/utils';
import * as React from 'react';

export interface InputWithIconProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, containerClassName, startIcon, endIcon, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', containerClassName)}>
        {startIcon ? (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none [&_svg]:size-4">
            {startIcon}
          </span>
        ) : null}
        <Input
          ref={ref}
          className={cn(
            startIcon ? '!pl-9' : null,
            endIcon ? '!pr-9' : null,
            className,
          )}
          {...props}
        />
        {endIcon ? (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground [&_svg]:size-4">
            {endIcon}
          </span>
        ) : null}
      </div>
    );
  },
);
InputWithIcon.displayName = 'InputWithIcon';

export { InputWithIcon };
