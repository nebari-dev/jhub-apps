import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { badgeVariants } from '@src/components/ui/badge';
import { cn } from '@src/lib/utils';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { type ComponentProps, createContext, useContext } from 'react';

type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

interface ComboboxFieldProps {
  /**
   * Shows an `×` control that resets the selection once the field has a value.
   * It replaces the trailing chevron rather than sitting beside it.
   * @default false
   */
  clearable?: boolean;
}

interface ComboboxInputProps
  extends ComboboxPrimitive.Input.Props,
    ComboboxFieldProps {
  /**
   * Class name for the outer field box. Inside `ComboboxChips` the input is a
   * bare text control and this prop is ignored.
   */
  fieldClassName?: string;
}

interface ComboboxChipsProps
  extends ComboboxPrimitive.Chips.Props,
    ComboboxFieldProps {
  /** Class name for the outer field box that wraps the chips and controls. */
  fieldClassName?: string;
}

/**
 * Combobox groups the input, popup, and option items — an autocomplete text
 * field paired with a filterable list. Value, open state, typeahead filtering
 * (`items` + Base UI's collator-based filter, overridable via `filter`),
 * multi-select, and Field integration come from Base UI.
 */
const Combobox = ComboboxPrimitive.Root;

/**
 * Matches items against the typed query using `Intl.Collator`. Pass the result
 * to `filter` on `Combobox` to customise how typeahead filtering matches.
 */
const useComboboxFilter = ComboboxPrimitive.useFilter;

/** Set by `ComboboxChips` so a nested `ComboboxInput` renders without its own field box. */
const ComboboxChipsContext = createContext(false);

/**
 * The 32px field box shared by single and multi mode. State comes from Base
 * UI's `InputGroup` (`data-popup-open`, `data-disabled`) and from the native
 * input it wraps (`:focus-visible`, `:disabled`, `aria-invalid`).
 */
const comboboxFieldClassName =
  'group/combobox relative flex min-h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-foreground text-sm shadow-xs outline-none motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) hover:border-border-strong has-focus-visible:border-ring has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:hover:border-ring data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring data-popup-open:hover:border-ring data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-muted data-disabled:text-muted-foreground-strong has-disabled:cursor-not-allowed has-disabled:border-border has-disabled:bg-muted has-disabled:text-muted-foreground-strong has-aria-invalid:border-destructive-foreground has-aria-invalid:ring-2 has-aria-invalid:ring-destructive-foreground has-aria-invalid:hover:border-destructive-foreground has-aria-invalid:has-focus-visible:border-destructive-foreground has-aria-invalid:has-focus-visible:ring-destructive-foreground has-aria-invalid:data-popup-open:border-destructive-foreground has-aria-invalid:data-popup-open:ring-destructive-foreground';

const comboboxInputClassName =
  'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground-strong disabled:placeholder:text-muted-foreground-strong';

const comboboxControlClassName =
  "flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed group-data-disabled/combobox:text-muted-foreground-strong group-has-disabled/combobox:text-muted-foreground-strong [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]";

/** Visual cue inside `ComboboxTrigger` that the field opens a list. */
function ComboboxIcon({ className, ...props }: ComboboxPrimitive.Icon.Props) {
  return (
    <ComboboxPrimitive.Icon
      data-slot="combobox-icon"
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <ChevronsUpDownIcon />
    </ComboboxPrimitive.Icon>
  );
}

/**
 * Button that opens the popup. Renders the `chevrons-up-down` icon by default;
 * pass children to replace it. Kept out of the tab order — the input already
 * opens the list on click, typing, or arrow keys.
 */
function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label="Open options"
      tabIndex={-1}
      className={cn(comboboxControlClassName, className)}
      {...props}
    >
      {children ?? <ComboboxIcon />}
    </ComboboxPrimitive.Trigger>
  );
}

/**
 * Clears the selection. Base UI only mounts it while there is something to
 * clear, so the empty field shows the chevron alone.
 */
function ComboboxClear({
  className,
  children,
  ...props
}: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label="Clear selection"
      className={cn(comboboxControlClassName, className)}
      {...props}
    >
      {children ?? <XIcon />}
    </ComboboxPrimitive.Clear>
  );
}

/**
 * Trailing controls of the field box. With `clearable`, the chevron hides once
 * a value is set (`data-placeholder` drops off the trigger) and `ComboboxClear`
 * mounts in its place.
 */
function ComboboxFieldControls({ clearable = false }: ComboboxFieldProps) {
  return (
    <>
      {clearable && <ComboboxClear />}
      <ComboboxTrigger
        className={cn(clearable && 'not-data-placeholder:hidden')}
      />
    </>
  );
}

/**
 * Typeahead text control. Standalone (single mode) it renders the full field
 * box — border, ring, chevron, optional clear — around the input; inside
 * `ComboboxChips` it renders only the input so it sits after the chips.
 *
 * Dropped inside a `Field`, the input is named by `FieldLabel` and marked
 * `aria-invalid` when the field is invalid; standalone, set `aria-invalid`
 * on it directly.
 */
function ComboboxInput({
  className,
  clearable,
  fieldClassName,
  ...props
}: ComboboxInputProps) {
  const insideChips = useContext(ComboboxChipsContext);

  const input = (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(comboboxInputClassName, className)}
      {...props}
    />
  );

  if (insideChips) {
    return input;
  }

  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-field"
      className={cn(comboboxFieldClassName, fieldClassName)}
    >
      {input}
      <ComboboxFieldControls clearable={clearable} />
    </ComboboxPrimitive.InputGroup>
  );
}

/** Displays the selected value. Renders no element of its own. */
const ComboboxValue = ComboboxPrimitive.Value;

/**
 * Maps a render function over a `ComboboxGroup`'s filtered `items`. Use it
 * inside groups rendered from a `ComboboxList` render function when `items`
 * on `Combobox` is an array of `{ value, items }` groups.
 */
const ComboboxCollection = ComboboxPrimitive.Collection;

/**
 * Multi-select field box. Render the selected values as `ComboboxChip`s via
 * `ComboboxValue`, followed by a `ComboboxInput` that stays typeable to the
 * right of the chips.
 */
function ComboboxChips({
  className,
  clearable,
  fieldClassName,
  children,
  ...props
}: ComboboxChipsProps) {
  return (
    <ComboboxChipsContext.Provider value={true}>
      <ComboboxPrimitive.InputGroup
        data-slot="combobox-field"
        className={cn(comboboxFieldClassName, 'flex-wrap', fieldClassName)}
      >
        <ComboboxPrimitive.Chips
          data-slot="combobox-chips"
          className={cn(
            'flex min-w-0 flex-1 flex-wrap items-center gap-1 *:data-[slot=combobox-input]:min-w-16',
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Chips>
        <ComboboxFieldControls clearable={clearable} />
      </ComboboxPrimitive.InputGroup>
    </ComboboxChipsContext.Provider>
  );
}

/**
 * A selected value inside `ComboboxChips`, styled like the `outline` `Badge`.
 * Renders its own `ComboboxChipRemove` after the label; Backspace on a
 * keyboard-highlighted chip removes it too.
 */
function ComboboxChip({
  className,
  children,
  ...props
}: ComboboxPrimitive.Chip.Props) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        badgeVariants({ variant: 'outline' }),
        'cursor-default pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxChipRemove
        aria-label={
          typeof children === 'string' ? `Remove ${children}` : 'Remove'
        }
      />
    </ComboboxPrimitive.Chip>
  );
}

/** The `×` control that removes its parent chip from the selection. */
function ComboboxChipRemove({
  className,
  children,
  ...props
}: ComboboxPrimitive.ChipRemove.Props) {
  return (
    <ComboboxPrimitive.ChipRemove
      data-slot="combobox-chip-remove"
      aria-label="Remove"
      className={cn(
        'flex size-3 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </ComboboxPrimitive.ChipRemove>
  );
}

/**
 * Portaled popup anchored to the field width. Place a `ComboboxEmpty` and a
 * `ComboboxList` inside. Enter/exit mirror `Select`: fade + 4px rise on the
 * `--duration-base` / `--ease-emphasized` tokens, gated behind `motion-safe`.
 */
function ComboboxContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground opacity-100 shadow-md ring-1 ring-foreground/10 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-base) motion-safe:ease-(--ease-emphasized)',
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

/**
 * The option list. Accepts either `ComboboxItem` children or a render function
 * `(item) => <ComboboxItem />` that Base UI maps over the filtered `items`.
 */
function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn('scroll-py-1 outline-none', className)}
      {...props}
    />
  );
}

/**
 * Selectable option row (28px). Highlight uses `bg-muted`; a trailing check
 * marks the selected value. Disabled items are announced, stay reachable by
 * keyboard, and cannot be selected — they never get the highlight treatment
 * from either pointer or keyboard.
 */
function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-hidden select-none not-data-[disabled]:data-[highlighted]:bg-muted not-data-[disabled]:data-[highlighted]:text-foreground data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="flex flex-1 min-w-0 truncate">{children}</span>
      <ComboboxItemIndicator />
    </ComboboxPrimitive.Item>
  );
}

/** Trailing check shown on selected items. */
function ComboboxItemIndicator({
  className,
  children,
  ...props
}: ComboboxPrimitive.ItemIndicator.Props) {
  return (
    <ComboboxPrimitive.ItemIndicator
      data-slot="combobox-item-indicator"
      className={cn(
        'pointer-events-none flex size-4 shrink-0 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children ?? <CheckIcon />}
    </ComboboxPrimitive.ItemIndicator>
  );
}

/** Groups related options under a `ComboboxGroupLabel`. */
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn('scroll-my-1', className)}
      {...props}
    />
  );
}

/** Non-interactive uppercase label for a `ComboboxGroup`. */
function ComboboxGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn(
        'px-1.5 py-1.5 font-medium text-muted-foreground text-xs uppercase tracking-[0.8px]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Visual separator between option groups. Purely decorative: a `separator`
 * role is not a permitted child of the `listbox`, and the groups are already
 * announced through their labels, so this renders a plain `div`.
 */
function ComboboxSeparator({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      data-slot="combobox-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/**
 * Centered message shown when filtering yields nothing. Base UI keeps the
 * element mounted as a live region and only renders the children while the
 * list is empty, so the padding is dropped while it has no content.
 */
function ComboboxEmpty({
  className,
  children = 'No results found.',
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        'px-3 py-5 text-center text-muted-foreground-strong text-sm empty:p-0',
        className,
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Empty>
  );
}

/**
 * Politely announced status line for async lists (loading, error). Stays
 * mounted like `ComboboxEmpty`; render children only while there is a message.
 */
function ComboboxStatus({
  className,
  ...props
}: ComboboxPrimitive.Status.Props) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn(
        'px-1.5 py-1 text-muted-foreground text-xs empty:p-0',
        className,
      )}
      {...props}
    />
  );
}

export type { ComboboxChipsProps, ComboboxContentProps, ComboboxInputProps };
export {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxIcon,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxSeparator,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxFilter,
};
