import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '@src/lib/utils';
import type { ComponentProps } from 'react';

type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Switch implemented from the Nebari Figma spec on top of Base UI's `Switch`.
 * Toggles a single setting on or off with immediate effect — reach for this
 * instead of `Checkbox` when the change applies instantly rather than on form
 * submit. Controlled via `checked` / `onCheckedChange`, or uncontrolled via
 * `defaultChecked`.
 *
 * Base UI threads `data-checked` / `data-unchecked` / `data-disabled` onto both
 * the root track and the thumb, which drive every visual state below.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none motion-safe:transition-colors motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-6 before:w-full before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[checked]:bg-primary data-[checked]:hover:bg-primary-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[unchecked]:bg-muted-foreground/40 data-[unchecked]:hover:bg-muted-foreground/70',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-full bg-background shadow-sm motion-safe:transition-transform motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) data-[checked]:translate-x-3.5 data-[unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export type { SwitchProps };
export { Switch };
