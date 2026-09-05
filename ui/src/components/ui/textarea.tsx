import { cn } from '@src/lib/utils';
import { TriangleAlert } from 'lucide-react';
import type { ComponentProps } from 'react';

type TextareaProps = ComponentProps<'textarea'>;

/**
 * Textarea is the multi-line text-entry primitive — a styled native
 * `<textarea>` that mirrors `Input`'s border, focus ring, disabled, and invalid
 * states from the Nebari Figma spec. To associate it inside a `Field`, render it
 * as the control: `<Field.Control render={<Textarea />} />`; standalone, pair it
 * with `Label` via `htmlFor` / `id`.
 *
 * The invalid state (`aria-invalid` / Base UI's `data-invalid`) gets a 2px
 * `destructive` outline plus a trailing `triangle-alert` icon — a non-color cue
 * that keeps it WCAG 1.4.1-compliant. Resizing is disabled while the control is
 * `disabled`; use a read-only textarea if you want a non-editable, resizeable one.
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <div className="relative w-full">
      <textarea
        data-slot="textarea"
        className={cn(
          'peer flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-muted-foreground motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:resize-none disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive-foreground aria-invalid:pr-9 aria-invalid:ring-2 aria-invalid:ring-destructive-foreground aria-invalid:focus-visible:ring-destructive-foreground data-[invalid]:border-destructive-foreground data-[invalid]:pr-9 data-[invalid]:ring-2 data-[invalid]:ring-destructive-foreground',
          className,
        )}
        {...props}
      />
      <TriangleAlert
        aria-hidden
        className="pointer-events-none absolute top-3 right-3 hidden size-[18px] text-destructive-foreground peer-aria-invalid:block peer-data-[invalid]:block"
      />
    </div>
  );
}

export type { TextareaProps };
export { Textarea };
