import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@src/lib/utils';
import { TriangleAlert } from 'lucide-react';
import type { ComponentProps } from 'react';

type InputProps = ComponentProps<typeof InputPrimitive>;

/**
 * Input is the single-line text-entry primitive, implemented from the Nebari
 * Figma spec on top of Base UI's `Input`. Dropped inside a `Field`, it wires its
 * accessible name and `aria-describedby` to `FieldLabel` / `FieldDescription`
 * automatically — no manual `htmlFor` / `id`. Standalone, pair it with `Label`
 * via `htmlFor` / `id`.
 *
 * States map to the design: `border-input` at rest, `border-border-strong` on
 * hover, a `ring` focus outline, `bg-muted` + dimmed when disabled, and — when
 * the field is invalid (driven by `aria-invalid` / Base UI's `data-invalid`) — a
 * 2px `destructive` outline plus a trailing `triangle-alert` icon. The icon is a
 * non-color cue so the invalid state stays compliant with WCAG 1.4.1 on its own.
 */
function Input({ className, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <InputPrimitive
        data-slot="input"
        className={cn(
          'peer flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-muted-foreground motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive-foreground aria-invalid:pr-9 aria-invalid:ring-2 aria-invalid:ring-destructive-foreground aria-invalid:focus-visible:ring-destructive-foreground data-[invalid]:border-destructive-foreground data-[invalid]:pr-9 data-[invalid]:ring-2 data-[invalid]:ring-destructive-foreground',
          className,
        )}
        {...props}
      />
      <TriangleAlert
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 hidden size-[18px] -translate-y-1/2 text-destructive-foreground peer-aria-invalid:block peer-data-[invalid]:block"
      />
    </div>
  );
}

export type { InputProps };
export { Input };
