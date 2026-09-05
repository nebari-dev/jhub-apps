import { cn } from '@src/lib/utils';
import type { ComponentProps } from 'react';

type LabelProps = ComponentProps<'label'>;

/**
 * Label is the standalone accessible label for a form control, styled from the
 * Nebari Figma spec. Pair it with a control via `htmlFor` / `id` when not using
 * `Field`. Inside a `Field`, prefer `FieldLabel` (built on Base UI's
 * `Field.Label`), which wires the association automatically. The
 * `peer-disabled:` styles dim the label when an adjacent `peer` control is
 * disabled.
 */
function Label({ className, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: association is the caller's responsibility via htmlFor or Field
    <label
      data-slot="label"
      className={cn(
        'select-none font-medium text-foreground text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export type { LabelProps };
export { Label };
