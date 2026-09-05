import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cn } from '@src/lib/utils';

// App-owned (not from the @nebari registry, which has no separator yet). Built
// on Base UI's accessible Separator and coloured with the theme border token.
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
