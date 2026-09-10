import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';

const radioGroupItemVariants = cva(
  'group/radio-group-item inline-flex cursor-pointer select-none items-start gap-2 text-left text-foreground outline-none active:text-muted-foreground-strong',
  {
    variants: {
      variant: {
        default:
          'rounded-sm border-2 border-transparent p-0.5 focus-visible:border-ring',
        box: 'rounded-sm border border-border bg-background p-3 hover:border-border-strong hover:bg-muted active:border-border-strong active:bg-muted focus-visible:border-2 focus-visible:border-ring',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const radioGroupVariants = cva('w-full rounded-sm', {
  variants: {
    orientation: {
      vertical: 'grid gap-3',
      horizontal: 'flex flex-wrap items-start gap-x-5 gap-y-3',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

type RadioGroupOrientation = NonNullable<
  VariantProps<typeof radioGroupVariants>['orientation']
>;

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, 'orientation'> & {
  /** Controls whether radio items stack vertically or wrap horizontally. */
  orientation?: RadioGroupOrientation;
};

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props, 'children'> &
  VariantProps<typeof radioGroupItemVariants> & {
    /** The visible and accessible radio label. */
    children?: ReactNode;
    /** Supplementary text exposed as the radio's accessible description. */
    description?: ReactNode;
  };

/** Provides mutually-exclusive selection state to a set of radio items. */
function RadioGroup({
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      {...props}
      className={(state) =>
        cn(
          radioGroupVariants({ orientation }),
          typeof className === 'function' ? className(state) : className,
        )
      }
      data-orientation={orientation}
      data-slot="radio-group"
    />
  );
}

/**
 * Labeled radio item implemented from the Nebari Figma spec on top of Base UI.
 *
 * `variant="default"` renders an inline option, while `variant="box"` turns
 * the same content into a bordered, clickable card. Selected, unselected, and
 * disabled state come from Base UI; hover, focus, and pressed visuals use their
 * native CSS interaction states.
 *
 * Radio-group validation belongs to the unanswered question, not to the group
 * container or each individual option. Keep item visuals neutral and pair
 * semantic group invalid state with a visible error message via `FieldError`.
 */
function RadioGroupItem({
  variant,
  className,
  children,
  description,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RadioGroupItemProps) {
  const generatedId = useId();
  const labelId = children == null ? undefined : `${generatedId}-label`;
  const descriptionId =
    description == null ? undefined : `${generatedId}-description`;
  const describedBy = [ariaDescribedBy, descriptionId]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioPrimitive.Root
      {...props}
      aria-describedby={describedBy || undefined}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ?? (ariaLabel === undefined ? labelId : undefined)
      }
      className={(state) => {
        return cn(
          radioGroupItemVariants({ variant }),
          state.checked &&
            '[&_[data-slot=radio-group-target]]:stroke-primary [&_[data-slot=radio-group-target]]:fill-primary active:[&_[data-slot=radio-group-target]]:stroke-primary-hover active:[&_[data-slot=radio-group-target]]:fill-primary-hover',
          state.disabled &&
            'pointer-events-none cursor-not-allowed text-muted-foreground [&_[data-slot=radio-group-target]]:stroke-border [&_[data-slot=radio-group-target]]:fill-muted [&_[data-slot=radio-group-description]]:text-muted-foreground',
          state.disabled &&
            variant === 'box' &&
            'border-transparent bg-background',
          state.disabled &&
            state.checked &&
            '[&_[data-slot=radio-group-target]]:stroke-transparent [&_[data-slot=radio-group-target]]:fill-muted-foreground [&_[data-slot=radio-group-control]]:text-background',
          typeof className === 'function' ? className(state) : className,
        );
      }}
      data-slot="radio-group-item"
      data-variant={variant ?? 'default'}
    >
      <svg
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 overflow-visible text-primary-foreground"
        data-slot="radio-group-control"
        viewBox="0 0 16 16"
      >
        <circle
          className="fill-transparent stroke-border-strong"
          cx="8"
          cy="8"
          data-slot="radio-group-target"
          r="7.25"
          strokeWidth="1.5"
        />
        <RadioPrimitive.Indicator
          className={(state) => cn(!state.checked && 'invisible')}
          data-slot="radio-group-indicator"
          keepMounted
          render={<g />}
        >
          <circle cx="8" cy="8" fill="currentColor" r="4" />
        </RadioPrimitive.Indicator>
      </svg>

      {(children != null || description != null) && (
        <span
          className="flex flex-col items-start gap-0.5 overflow-hidden text-sm leading-5"
          data-slot="radio-group-text"
        >
          {children != null && (
            <span
              className="font-medium group-hover/radio-group-item:underline group-active/radio-group-item:no-underline"
              data-slot="radio-group-label"
              id={labelId}
            >
              {children}
            </span>
          )}
          {description != null && (
            <span
              className="font-normal text-muted-foreground group-active/radio-group-item:text-muted-foreground-strong"
              data-slot="radio-group-description"
              id={descriptionId}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </RadioPrimitive.Root>
  );
}

export type { RadioGroupItemProps, RadioGroupProps };
export {
  RadioGroup,
  RadioGroupItem,
  radioGroupItemVariants,
  radioGroupVariants,
};
