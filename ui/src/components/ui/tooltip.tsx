import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from '@src/lib/utils';
import { createContext, useContext, useId } from 'react';

type TooltipContextValue = {
  contentId: string;
  disabled: boolean;
};

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  > & {
    /** Props forwarded to the Base UI Portal. */
    portalProps?: TooltipPrimitive.Portal.Props;
    /** Renders the small arrow anchored to the trigger. */
    showArrow?: boolean;
  };

const TooltipContext = createContext<TooltipContextValue | null>(null);

/** Provides shared open and close timing for a group of tooltips. */
function TooltipProvider({
  delay = 0,
  closeDelay = 100,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

/**
 * Tooltip groups a trigger with supplemental, non-interactive content.
 * It opens on hover and keyboard focus, remains hoverable, and closes on Escape.
 */
function Tooltip({
  children,
  disabled = false,
  disableHoverablePopup = false,
  ...props
}: TooltipPrimitive.Root.Props) {
  const generatedId = useId();

  return (
    <TooltipContext.Provider
      value={{ contentId: `${generatedId}-tooltip`, disabled }}
    >
      <TooltipPrimitive.Root
        disabled={disabled}
        disableHoverablePopup={disableHoverablePopup}
        {...props}
      >
        {children ?? <span data-slot="tooltip" hidden />}
      </TooltipPrimitive.Root>
    </TooltipContext.Provider>
  );
}

/** Element that opens the tooltip on hover or keyboard focus. */
function TooltipTrigger({
  'aria-describedby': ariaDescribedBy,
  disabled,
  ...props
}: TooltipPrimitive.Trigger.Props) {
  const context = useContext(TooltipContext);
  const contentId =
    context?.disabled || disabled ? undefined : context?.contentId;
  const describedBy = [ariaDescribedBy, contentId].filter(Boolean).join(' ');

  return (
    <TooltipPrimitive.Trigger
      aria-describedby={describedBy || undefined}
      data-slot="tooltip-trigger"
      disabled={disabled}
      {...props}
    />
  );
}

/** Portaled tooltip surface positioned against its trigger. */
function TooltipContent({
  className,
  side = 'top',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  portalProps,
  showArrow = true,
  style,
  children,
  ...props
}: TooltipContentProps) {
  const context = useContext(TooltipContext);

  return (
    <TooltipPrimitive.Portal {...portalProps}>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 pointer-events-auto"
      >
        <TooltipPrimitive.Popup
          {...props}
          data-slot="tooltip-content"
          id={context?.contentId ?? props.id}
          role="tooltip"
          className={(state) =>
            cn(
              'pointer-events-auto relative z-50 w-max max-w-xs origin-(--transform-origin) rounded-sm bg-foreground px-2.5 py-1.5 text-background text-xs leading-4 shadow-md outline-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-emphasized) has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:ml-1.5 **:data-[slot=kbd]:rounded-sm **:data-[slot=kbd]:bg-background/10 **:data-[slot=kbd]:px-1.5 **:data-[slot=kbd]:py-0.5 **:data-[slot=kbd]:font-mono **:data-[slot=kbd]:text-[0.6875rem] **:data-[slot=kbd]:leading-3',
              typeof className === 'function' ? className(state) : className,
            )
          }
          style={(state) => ({
            ...(typeof style === 'function' ? style(state) : style),
            pointerEvents: 'auto',
          })}
        >
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow
              data-slot="tooltip-arrow"
              className="pointer-events-none z-50 size-2.5 rotate-45 bg-foreground data-[side=bottom]:bottom-full data-[side=bottom]:translate-y-1/2 data-[side=left]:left-full data-[side=left]:-translate-x-1/2 data-[side=right]:right-full data-[side=right]:translate-x-1/2 data-[side=top]:top-full data-[side=top]:-translate-y-1/2"
            />
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  TooltipProvider,
  TooltipTrigger,
};
