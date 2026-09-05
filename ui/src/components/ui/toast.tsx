import {
  type ToastManager,
  type ToastManagerPromiseOptions,
  Toast as ToastPrimitive,
  type UseToastManagerReturnValue,
} from '@base-ui/react/toast';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Bell,
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

/** Semantic color treatment for each toast status icon. */
const toastIconVariants = cva(
  'flex shrink-0 items-start overflow-hidden pt-px [&_svg]:pointer-events-none [&_svg]:size-[18px]',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        success: 'text-success-foreground',
        warning: 'text-warning-foreground',
        error: 'text-destructive-foreground',
        info: 'text-info-foreground',
        loading: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Status treatments supported by Nebari's built-in toast renderer. */
type ToastType = NonNullable<VariantProps<typeof toastIconVariants>['variant']>;

/** Optional behavior flags stored on a toast manager item. */
interface ToastData {
  /** Hides the leading status icon when set to `false`. */
  showIcon?: boolean;
  /**
   * Hides the close button when set to `false`. Ignored on a toast carrying an
   * `actionProps` action, which always keeps a way to dismiss it.
   */
  dismissible?: boolean;
}

/** Props for an individual Base UI toast root. */
type ToastProps = Omit<ToastPrimitive.Root.Props, 'toast'> & {
  /** Toast manager item rendered by the root. */
  toast?: ToastPrimitive.Root.ToastObject<ToastData>;
};

/** Props for the complete toast renderer installed at the application root. */
interface ToasterProps extends ToastPrimitive.Provider.Props {
  /** Props forwarded to the portal that contains the toast viewport. */
  portalProps?: Omit<ToastPrimitive.Portal.Props, 'children'>;
  /** Props forwarded to the fixed bottom-right toast viewport. */
  viewportProps?: Omit<ToastPrimitive.Viewport.Props, 'children'>;
}

/**
 * Status types announced assertively. Base UI mirrors a `priority: 'high'` item
 * into a visually hidden `role="alert"` node, which interrupts the screen
 * reader; every other type is announced through the viewport's polite
 * `aria-live` region so it doesn't cut off whatever the user is doing. The split
 * mirrors the `role` mapping the `Alert` component applies to its own variants.
 */
const assertiveToastTypes = new Set<ToastType>(['warning', 'error']);

/** The subset of a manager item Nebari derives accessibility defaults from. */
interface ToastA11yOptions {
  actionProps?: unknown;
  priority?: 'low' | 'high';
  timeout?: number;
  type?: string;
}

/**
 * Applies Nebari's accessibility rules to a manager item:
 *
 * - `priority` follows the status type, so `warning` and `error` interrupt.
 *   This one is a default: an explicit `priority` is left alone, and it is only
 *   assigned when the caller named a `type`, so a partial `update` that says
 *   nothing about the type cannot reassign the item's priority.
 * - a toast carrying an action never auto-dismisses, so the action cannot
 *   disappear before it is used (WCAG 2.2.1). This one is not a default —
 *   it overrides an explicit `timeout` rather than deferring to it. A toast is
 *   either a notification, which may time out, or a prompt to act, which waits.
 *   A caller who wants the timer keeps the action out of the toast.
 *   {@link ToastList} pairs it with a close control that cannot be switched
 *   off, so such a toast is dismissible rather than permanent.
 *
 * Both read the patch in front of them, not the item it will be merged onto:
 * Base UI merges an update shallowly, so an `update` that changes the timeout
 * of an already-actionable toast without restating `actionProps` is not
 * re-checked. Keys are only added when they have a value, since emitting
 * `undefined` would erase what is already on the item.
 */
function withToastA11yDefaults<T extends ToastA11yOptions>(options: T): T {
  const patch: ToastA11yOptions = {};

  if (options.priority === undefined && options.type !== undefined) {
    patch.priority = assertiveToastTypes.has(getToastType(options.type))
      ? 'high'
      : 'low';
  }

  if (options.actionProps != null) {
    patch.timeout = 0;
  }

  return Object.keys(patch).length > 0 ? { ...options, ...patch } : options;
}

/** Applies {@link withToastA11yDefaults} to one state of a promise toast. */
function withPromiseStateA11yDefaults<State>(state: State): State {
  // Base UI resolves the string form to a description-only toast, which carries
  // neither a type nor an action, so there is nothing to default.
  if (typeof state === 'string') {
    return state;
  }

  if (typeof state === 'function') {
    return ((result: unknown) =>
      withPromiseStateA11yDefaults(
        (state as (value: unknown) => unknown)(result),
      )) as State;
  }

  return withToastA11yDefaults(state as ToastA11yOptions) as State;
}

/** Applies {@link withToastA11yDefaults} to all three states of `promise`. */
function withPromiseA11yDefaults<Value, Data extends object>(
  options: ToastManagerPromiseOptions<Value, Data>,
): ToastManagerPromiseOptions<Value, Data> {
  return {
    loading: withPromiseStateA11yDefaults(options.loading),
    success: withPromiseStateA11yDefaults(options.success),
    error: withPromiseStateA11yDefaults(options.error),
  };
}

/**
 * Creates an isolated toast manager for a scoped renderer or a test. Wraps
 * Base UI's factory so `add`, `update`, and `promise` all apply
 * {@link withToastA11yDefaults}.
 */
function createToastManager<
  Data extends ToastData = ToastData,
>(): ToastManager<Data> {
  const manager = ToastPrimitive.createToastManager<Data>();

  return {
    ...manager,
    add: (options) => manager.add(withToastA11yDefaults(options)),
    update: (id, updates) => manager.update(id, withToastA11yDefaults(updates)),
    promise: (promiseValue, options) =>
      manager.promise(promiseValue, withPromiseA11yDefaults(options)),
  };
}

/**
 * Reads the nearest provider's toasts and its imperative methods, which apply
 * the same accessibility defaults as {@link createToastManager}. Use this in a
 * custom renderer, or to raise a toast from a component below {@link Toaster}.
 */
function useToastManager<
  Data extends ToastData = ToastData,
>(): UseToastManagerReturnValue<Data> {
  const manager = ToastPrimitive.useToastManager<Data>();

  return useMemo(
    () => ({
      ...manager,
      add: (options) => manager.add(withToastA11yDefaults(options)),
      update: (id, updates) =>
        manager.update(id, withToastA11yDefaults(updates)),
      promise: (promiseValue, options) =>
        manager.promise(promiseValue, withPromiseA11yDefaults(options)),
    }),
    [manager],
  );
}

/** Global manager used by the default {@link Toaster}. */
const toast = createToastManager<ToastData>();

/**
 * Class list for a toast root. Base UI publishes the geometry of the stack as
 * CSS custom properties on each root — `--toast-index` (0 is frontmost),
 * `--toast-height`, `--toast-offset-y`, and `--toast-swipe-movement-{x,y}` —
 * and this list turns them into the Figma stack:
 *
 * - `--gap` / `--peek` are the expanded spacing and the collapsed sliver of
 *   each toast behind the frontmost one.
 * - `--scale` shrinks each toast a further 10% per step back, and `--shrink`
 *   is the height that shrinking gives back, so collapsed toasts stay pinned
 *   to the frontmost one's bottom edge.
 * - `--offset-y` is the expanded translation: the viewport offset plus one
 *   `--gap` per step back, adjusted by any in-flight swipe.
 *
 * Collapsed (default) uses `--peek`/`--scale`; `data-expanded` (viewport
 * hovered or focused) switches to full height and `--offset-y`. The `after`
 * pseudo-element bridges the `--gap` so pointer travel between stacked toasts
 * doesn't collapse the stack. The `data-ending-style` rules send an exiting
 * toast off the edge it was swiped toward, falling back to downward when it
 * was dismissed without a swipe.
 */
const toastRootClassName = cn(
  'group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full origin-bottom rounded-md border border-border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
  '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--toast-height))))_scale(var(--scale))]',
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
  'data-limited:opacity-0 data-starting-style:translate-y-[150%]',
  '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:translate-y-[150%]',
  'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
  'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
  'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
  'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
  'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-swiping:motion-safe:duration-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-slow) motion-safe:ease-(--ease-emphasized)',
);

/** Normalizes arbitrary Base UI toast types to a supported visual treatment. */
function getToastType(type: string | undefined): ToastType {
  switch (type) {
    case 'success':
    case 'warning':
    case 'error':
    case 'info':
    case 'loading':
      return type;
    default:
      return 'default';
  }
}

/** Provides toast state and timing to descendant toast primitives. */
function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

/** Portals the toast viewport to the document body. */
function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

/**
 * Fixed bottom-right region that contains the toast stack. It is responsive on
 * small screens and matches Figma's 400 px desktop width.
 */
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[400px] outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Root for one managed toast. Base UI supplies stacking, focus pause, and swipe
 * dismissal; Nebari supplies the neutral Figma surface and tokenized motion.
 * A root is normally rendered for you by {@link Toaster}; render it directly
 * only when composing a custom renderer around {@link useToastManager}.
 * Without a `toast` item there is nothing to render, so — like `Dialog` and
 * `Tooltip` — it falls back to a hidden placeholder rather than an empty
 * surface, which also keeps the registry's SSR probe safe.
 *
 * The surface is not a focus stop; see {@link Toaster} for the keyboard model.
 * A caller who gives it something to do on click opts back in by passing
 * `tabIndex={0}`, and owns the key handler that makes it operable.
 */
function Toast({
  className,
  tabIndex,
  toast: toastItem,
  ...props
}: ToastProps) {
  const variant = getToastType(toastItem?.type);

  if (!toastItem) {
    return <div data-slot="toast" data-variant={variant} hidden />;
  }

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      // A `loading` toast is reporting work still in flight, so the surface is
      // marked busy until the manager updates it to a settled type.
      aria-busy={variant === 'loading' || undefined}
      className={cn(toastRootClassName, className)}
      // Base UI makes every toast root tabbable by default, which is a stop on
      // a surface that does nothing when activated — and a second stop ahead of
      // the action on a toast that carries one. Nothing is lost by dropping it:
      // the surface keeps its `dialog` role and name for a screen reader's
      // virtual cursor, and Base UI's `F6` entry focuses it programmatically,
      // which `tabIndex={-1}` still permits.
      tabIndex={tabIndex ?? -1}
      toast={toastItem}
      {...props}
    />
  );
}

/** Lays out a toast's icon, copy, action, and close control. */
function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'flex h-full items-center gap-3 overflow-hidden p-3 opacity-100 has-data-[slot=toast-description]:items-start data-behind:opacity-0 data-expanded:opacity-100 motion-safe:transition-opacity motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)',
        className,
      )}
      {...props}
    />
  );
}

/** Renders the toast's concise heading. */
function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-sm leading-5 font-medium', className)}
      {...props}
    />
  );
}

/** Renders supporting text below the toast title. */
function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-muted-foreground text-sm leading-5', className)}
      {...props}
    />
  );
}

/**
 * Optional short action rendered from a manager item's `actionProps`. Defaults
 * to Nebari's 28 px outline button from the Figma design.
 *
 * Base UI treats an action as a button, so composing one into a link takes
 * three parts. Without `nativeButton={false}` it warns and keeps applying
 * native button semantics to an element that has none; with it, it applies
 * `role="button"` instead — and the render element's own `role` is what wins
 * that back. Omit either and the anchor stops being a link.
 *
 * ```tsx
 * <ToastAction
 *   nativeButton={false}
 *   render={<a href="/deployments" role="link" />}
 * />
 * ```
 *
 * A linter may call that `role` redundant on an anchor. It is not: without it
 * the rendered element announces as a button.
 */
function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      // `Button` offsets its focus ring in `background`, which is the page
      // colour, not this surface — on a `popover` toast that paints a visibly
      // different band between the button's border and its ring, reading as a
      // second border. Re-point it at the surface the button actually sits on,
      // the way `Sidebar` does for its own.
      className={cn(
        'shrink-0 shadow-none focus-visible:ring-offset-popover',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Dismisses its containing toast and defaults to the Figma close icon button.
 * Base UI keeps the control out of the accessibility tree while the stack is
 * collapsed and exposes it once the viewport is hovered or focused, so its
 * label is only ever announced in the context of a focused toast.
 */
function ToastClose({
  className,
  children,
  'aria-label': ariaLabel = 'Dismiss',
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label={ariaLabel}
      render={render}
      // Offset the focus ring in the toast's own surface, not the page's — see
      // {@link ToastAction}.
      className={cn(
        "relative shrink-0 text-foreground after:absolute after:-inset-2 after:content-[''] focus-visible:ring-offset-popover",
        className,
      )}
      {...props}
    >
      {children ?? <X aria-hidden="true" className="size-4" />}
    </ToastPrimitive.Close>
  );
}

/** Props accepted by {@link ToastIcon}. */
interface ToastIconProps {
  /** Additional classes merged after the icon variant classes. */
  className?: string;
  /**
   * Visual status represented by the icon. Any value outside {@link ToastType}
   * — including the `undefined` a manager item carries when no type was set —
   * falls back to the neutral `default` treatment.
   */
  type?: string;
}

/** Selects the status icon and semantic color associated with a toast type. */
function ToastIcon({ className, type }: ToastIconProps) {
  const variant = getToastType(type);
  let icon: ReactNode;

  switch (variant) {
    case 'success':
      icon = <CircleCheck aria-hidden="true" />;
      break;
    case 'warning':
      icon = <TriangleAlert aria-hidden="true" />;
      break;
    case 'error':
      icon = <CircleX aria-hidden="true" />;
      break;
    case 'info':
      icon = <Info aria-hidden="true" />;
      break;
    case 'loading':
      icon = (
        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
      );
      break;
    default:
      icon = <Bell aria-hidden="true" />;
  }

  return (
    <span
      data-slot="toast-icon"
      data-variant={variant}
      className={cn(toastIconVariants({ variant }), className)}
    >
      {icon}
    </span>
  );
}

/** Renders every active item from the nearest toast manager. */
function ToastList() {
  // Reads through Nebari's wrapper rather than Base UI's hook so there is one
  // way into the manager from this file, and adding an imperative call here
  // later can't quietly skip {@link withToastA11yDefaults}.
  const { toasts } = useToastManager<ToastData>();

  return toasts.map((toastItem) => {
    const showIcon = toastItem.data?.showIcon !== false;
    // An action must never be the only way out of a toast: one that carries an
    // action keeps its close control even if `data.dismissible` says otherwise,
    // which pairs with the timer `withToastA11yDefaults` clears for it.
    const dismissible =
      toastItem.actionProps != null || toastItem.data?.dismissible !== false;

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent>
          {showIcon && <ToastIcon type={toastItem.type} />}
          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden break-words">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          {dismissible && <ToastClose />}
        </ToastContent>
      </Toast>
    );
  });
}

/**
 * Complete Nebari toast renderer. Mount once near the application root, then
 * call `add`, `update`, or `promise` on the global {@link toast} manager (or on
 * a scoped one passed as `toastManager`) from application code. The visible
 * stack is capped at five items by default to match Figma.
 *
 * Accessibility, all supplied by Base UI unless noted:
 *
 * - **Announcements.** The viewport is one standing polite `aria-live` region
 *   labelled "Notifications". `warning` and `error` toasts are raised to
 *   `priority: 'high'` by {@link withToastA11yDefaults} and additionally
 *   mirrored into a visually hidden `role="alert"`, so they interrupt. Two
 *   standing regions rather than one that retags itself per toast: a screen
 *   reader reads a live region's configuration when the region is registered,
 *   so swapping `aria-live` on the viewport would not take effect for the toast
 *   that triggered the swap — and one viewport can hold a `warning` and an
 *   `info` at the same time, which leaves nothing to swap to. For the same
 *   reason it is a named `region` with `aria-atomic="false"` rather than a
 *   `role="status"`: it stays a navigable landmark, and only the toast that
 *   just arrived is read out instead of the whole stack on every add.
 * - **Keyboard.** `F6` from anywhere moves focus onto the viewport and pauses
 *   the timers. `Tab` from there enters the frontmost toast — Base UI's focus
 *   guard puts focus on the surface itself, so the title and description are
 *   announced as one dialog — then reaches its action and close control in DOM
 *   order. That surface is deliberately not in the sequential tab order, so it
 *   is never a stop ahead of the action for someone tabbing through the page;
 *   `F6` is the way in. `Escape` is handled per toast, so it dismisses
 *   whichever one holds focus — the keyboard equivalent of swipe-to-dismiss —
 *   and does nothing while focus is still on the viewport itself. `Shift+Tab`
 *   off the viewport restores focus to where it was and resumes the timers.
 * - **Timers.** Auto-dismiss pauses while the viewport is hovered, holds a
 *   focus-visible element, or the window is blurred, and on touch pointer-down;
 *   it resumes on leave or blur. A `loading` toast never auto-dismisses, and
 *   neither does one carrying an action — whatever `timeout` it was given.
 */
function Toaster({
  children,
  limit = 5,
  portalProps,
  toastManager = toast,
  viewportProps,
  ...props
}: ToasterProps) {
  return (
    <ToastProvider limit={limit} toastManager={toastManager} {...props}>
      {children}
      <ToastPortal {...portalProps}>
        <ToastViewport {...viewportProps}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export type { ToastData, ToasterProps, ToastIconProps, ToastProps, ToastType };
export {
  createToastManager,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  toastIconVariants,
  useToastManager,
};
