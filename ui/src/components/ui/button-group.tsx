import { useRender } from '@base-ui/react/use-render';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

/** Returns the layout and shared-seam classes for a Button Group. */
const buttonGroupVariants = cva(
  'm-0 flex min-w-0 w-fit items-stretch border-0 p-0 *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 [&>input]:flex-1',
  {
    variants: {
      orientation: {
        horizontal:
          'flex-row [&>[data-slot]]:rounded-r-none [&>[data-slot]~[data-slot]]:-ml-px [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md',
        vertical:
          'flex-col [&>[data-slot]]:rounded-b-none [&>[data-slot]~[data-slot]]:-mt-px [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

/** Props for the {@link ButtonGroup} segmented-control container. */
type ButtonGroupProps = React.ComponentProps<'fieldset'> & {
  /**
   * Controls whether the grouped controls are joined horizontally or
   * vertically.
   * @default 'horizontal'
   */
  orientation?: VariantProps<typeof buttonGroupVariants>['orientation'];
};

/**
 * Groups closely related actions into one segmented control with shared seams
 * and unified outer corners. Label each group with `aria-label` or
 * `aria-labelledby`. For mutually exclusive state, use controls that expose
 * their selected or pressed state to assistive technology.
 */
function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <fieldset
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

/**
 * Props for {@link ButtonGroupText}, including Base UI's polymorphic `render`
 * prop.
 */
type ButtonGroupTextProps = useRender.ComponentProps<'div'>;

/**
 * Renders non-interactive supporting text inside a ButtonGroup. Use the
 * `render` prop to substitute another element while preserving group styling.
 */
function ButtonGroupText({
  className,
  ref,
  render = <div />,
  ...props
}: ButtonGroupTextProps) {
  return useRender({
    render,
    ref,
    props: {
      className: cn(
        'flex items-center gap-2 rounded-md border border-input bg-muted px-2.5 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      ),
      'data-slot': 'button-group-text',
      ...props,
    },
  });
}

/** Props for the semantic {@link ButtonGroupSeparator} divider. */
type ButtonGroupSeparatorProps = React.ComponentProps<'hr'> & {
  /**
   * Sets the separator's semantic direction and corresponding dimensions.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
};

/**
 * Adds a semantic divider between borderless ButtonGroup children. Outline
 * buttons already provide their own shared seam and do not need a separator.
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <hr
      aria-orientation={orientation}
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn(
        'relative shrink-0 self-stretch border-0 bg-border',
        orientation === 'vertical' ? 'my-px w-px' : 'mx-px h-px',
        className,
      )}
      {...props}
    />
  );
}

export type {
  ButtonGroupProps,
  ButtonGroupSeparatorProps,
  ButtonGroupTextProps,
};
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
