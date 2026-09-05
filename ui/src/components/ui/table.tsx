import { cn } from '@src/lib/utils';
import type * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type TableProps = React.ComponentProps<'table'> & {
  /** Accessible name for the horizontal scroll container. */
  scrollContainerLabel?: string;
  /** Additional classes for the horizontal scroll container. */
  scrollContainerClassName?: string;
  /**
   * Props forwarded to the horizontal scroll container. Its `tabIndex`
   * overrides the automatic focusability applied when the table overflows.
   */
  scrollContainerProps?: Omit<React.ComponentProps<'section'>, 'children'>;
};

type TableHeadProps = Omit<
  React.ComponentProps<'th'>,
  'onClick' | 'onKeyDown'
> & {
  /** Makes the header sortable by rendering its contents in a real button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
};

/** Responsive table frame with Nebari border, radius, and surface styling. */
function Table({
  className,
  scrollContainerClassName,
  scrollContainerLabel,
  scrollContainerProps,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: TableProps) {
  const {
    className: scrollContainerPropsClassName,
    'aria-label': scrollContainerAriaLabel,
    'aria-labelledby': scrollContainerAriaLabelledBy,
    ref: scrollContainerRef,
    tabIndex: scrollContainerTabIndex,
    ...resolvedScrollContainerProps
  } = scrollContainerProps ?? {};
  const internalScrollContainerRef = useRef<HTMLElement>(null);
  const [isHorizontallyScrollable, setIsHorizontallyScrollable] =
    useState(false);
  const setScrollContainerRef = useCallback(
    (element: HTMLElement | null) => {
      internalScrollContainerRef.current = element;

      if (typeof scrollContainerRef === 'function') {
        return scrollContainerRef(element);
      }

      if (scrollContainerRef) {
        scrollContainerRef.current = element;
      }
    },
    [scrollContainerRef],
  );
  const resolvedScrollContainerLabel =
    scrollContainerAriaLabel ??
    scrollContainerLabel ??
    (ariaLabel === undefined
      ? 'Table scroll area'
      : `${ariaLabel} scroll area`);

  useEffect(() => {
    const scrollContainer = internalScrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const updateScrollability = () => {
      setIsHorizontallyScrollable(
        scrollContainer.scrollWidth > scrollContainer.clientWidth,
      );
    };

    updateScrollability();
    window.addEventListener('resize', updateScrollability);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateScrollability);
    resizeObserver?.observe(scrollContainer);

    const table = scrollContainer.querySelector('table');
    if (table) {
      resizeObserver?.observe(table);
    }

    return () => {
      window.removeEventListener('resize', updateScrollability);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section
      {...resolvedScrollContainerProps}
      aria-label={
        scrollContainerAriaLabelledBy === undefined
          ? resolvedScrollContainerLabel
          : undefined
      }
      aria-labelledby={scrollContainerAriaLabelledBy}
      data-slot="table-container"
      ref={setScrollContainerRef}
      tabIndex={
        scrollContainerTabIndex ?? (isHorizontallyScrollable ? 0 : undefined)
      }
      className={cn(
        'relative w-full overflow-x-auto rounded-md border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        scrollContainerClassName,
        scrollContainerPropsClassName,
      )}
    >
      <table
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-slot="table"
        className={cn(
          'w-full border-collapse bg-card caption-bottom text-left text-sm',
          className,
        )}
        {...props}
      />
    </section>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-background', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-border bg-card font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border hover:bg-muted/50 data-[state=selected]:bg-muted data-[state=selected]:hover:bg-muted motion-safe:transition-[color,background-color] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  children,
  onClick,
  onKeyDown,
  tabIndex,
  ...props
}: TableHeadProps) {
  const isInteractive = onClick != null;
  const ariaSort = props['aria-sort'] ?? (isInteractive ? 'none' : undefined);

  return (
    <th
      {...props}
      aria-sort={ariaSort}
      data-slot="table-head"
      tabIndex={isInteractive ? undefined : tabIndex}
      className={cn(
        'relative h-10 bg-background text-left align-middle font-medium text-foreground text-sm leading-5 tracking-normal whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        isInteractive ? 'p-0' : 'px-4',
        className,
      )}
    >
      {isInteractive ? (
        <button
          className="inline-flex h-10 w-full cursor-pointer items-center justify-start gap-1 bg-transparent px-4 text-left font-medium text-foreground text-sm leading-5 tracking-normal underline-offset-4 outline-none hover:bg-muted-foreground/10 hover:underline focus-visible:bg-muted-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-safe:transition-[color,background-color] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)"
          data-slot="table-head-button"
          onClick={onClick}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          type="button"
        >
          {children}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'h-12 px-4 py-3 align-middle text-foreground text-sm leading-5 [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('px-4 py-3 text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

export type { TableHeadProps, TableProps };
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
