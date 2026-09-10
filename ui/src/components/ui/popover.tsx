import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@src/lib/utils';

// App-owned (not from the @nebari registry, which has no popover yet). Built on
// Base UI like the registry components and styled with the same semantic tokens
// and motion as the registry's dropdown-menu / select popups.

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'collisionPadding'
  >;

/** Groups popover open state and sub-parts for trigger/content composition. */
const Popover = PopoverPrimitive.Root;

/** Element that toggles the popover. Renders a `<button>` unless `render` swaps it. */
function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/** Portaled popup surface positioned against the trigger. */
function PopoverContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionPadding = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'z-50 w-72 origin-(--transform-origin) rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-base) motion-safe:ease-(--ease-emphasized)',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export type { PopoverContentProps };
export { Popover, PopoverContent, PopoverTrigger };
