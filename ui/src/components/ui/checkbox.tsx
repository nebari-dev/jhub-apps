import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import { cn } from '@src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { type ReactNode, useId } from 'react';

const checkboxGroupVariants = cva('w-full rounded-sm', {
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

const checkboxVariants = cva(
  'group/checkbox inline-flex cursor-pointer select-none items-start gap-2 text-left text-foreground outline-none active:text-muted-foreground-strong',
  {
    variants: {
      variant: {
        default:
          'rounded-[2px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        box: 'rounded-sm border border-border bg-background p-3 hover:border-border-strong hover:bg-muted active:border-border-strong active:bg-muted focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type CheckboxGroupOrientation = NonNullable<
  VariantProps<typeof checkboxGroupVariants>['orientation']
>;

type CheckboxGroupProps = Omit<CheckboxGroupPrimitive.Props, 'orientation'> & {
  /** Controls whether checkbox items stack vertically or wrap horizontally. */
  orientation?: CheckboxGroupOrientation;
};

type CheckboxProps = Omit<
  CheckboxPrimitive.Root.Props,
  'children' | 'className'
> &
  VariantProps<typeof checkboxVariants> & {
    /** The visible and accessible checkbox label. */
    children?: ReactNode;
    /** Supplementary text exposed as the checkbox's accessible description. */
    description?: ReactNode;
  };

/** Groups related checkboxes and controls their vertical or horizontal layout. */
function CheckboxGroup({
  className,
  orientation = 'vertical',
  ...props
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      {...props}
      className={(state) =>
        cn(
          checkboxGroupVariants({ orientation }),
          typeof className === 'function' ? className(state) : className,
        )
      }
      data-orientation={orientation}
      data-slot="checkbox-group"
    />
  );
}

/**
 * Checkbox implemented from the Nebari Figma spec on top of Base UI.
 *
 * `variant="default"` renders an inline label and description, while
 * `variant="box"` turns the same content into a bordered, clickable card.
 * Checked, unchecked, indeterminate, disabled, and validation state come from
 * Base UI; hover, focus, and pressed visuals use their native CSS interaction
 * states.
 */
function Checkbox({
  variant,
  children,
  description,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const labelId = children == null ? undefined : `${generatedId}-label`;
  const descriptionId =
    description == null ? undefined : `${generatedId}-description`;
  const describedBy = [ariaDescribedBy, descriptionId]
    .filter(Boolean)
    .join(' ');
  const isAriaInvalid = ariaInvalid === true || ariaInvalid === 'true';

  return (
    <CheckboxPrimitive.Root
      {...props}
      aria-describedby={describedBy || undefined}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ?? (ariaLabel === undefined ? labelId : undefined)
      }
      className={(state) => {
        const isInvalid = state.valid === false || isAriaInvalid;
        const isMarked = state.checked || state.indeterminate;

        return cn(
          checkboxVariants({ variant }),
          isMarked &&
            '[&_[data-slot=checkbox-control]]:border-primary [&_[data-slot=checkbox-control]]:bg-primary active:[&_[data-slot=checkbox-control]]:border-primary-hover active:[&_[data-slot=checkbox-control]]:bg-primary-hover',
          isInvalid &&
            'text-destructive-foreground active:text-destructive-foreground [&_[data-slot=checkbox-control]]:border-destructive-foreground [&_[data-slot=checkbox-description]]:text-destructive-foreground',
          isInvalid &&
            variant === 'box' &&
            'border-destructive-foreground bg-destructive hover:border-destructive-foreground hover:bg-destructive active:border-destructive-foreground active:bg-destructive',
          isInvalid &&
            isMarked &&
            '[&_[data-slot=checkbox-control]]:bg-destructive-foreground active:[&_[data-slot=checkbox-control]]:bg-destructive-foreground',
          state.disabled &&
            'pointer-events-none cursor-not-allowed text-muted-foreground [&_[data-slot=checkbox-control]]:border-border [&_[data-slot=checkbox-control]]:bg-muted [&_[data-slot=checkbox-description]]:text-muted-foreground',
          state.disabled &&
            variant === 'box' &&
            'border-transparent bg-background',
          state.disabled &&
            isMarked &&
            '[&_[data-slot=checkbox-control]]:border-transparent [&_[data-slot=checkbox-control]]:bg-muted-foreground [&_[data-slot=checkbox-control]]:text-background',
        );
      }}
      data-slot="checkbox"
      data-variant={variant ?? 'default'}
    >
      <span
        className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border-[1.5px] border-border-strong bg-transparent text-primary-foreground"
        data-slot="checkbox-control"
      >
        <CheckboxPrimitive.Indicator
          className={(state) =>
            cn(
              'absolute inset-0 grid place-content-center text-current [&_svg]:size-3',
              (!state.checked || state.indeterminate) && 'invisible',
            )
          }
          data-slot="checkbox-indicator"
          keepMounted
        >
          <CheckIcon aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
        <CheckboxPrimitive.Indicator
          className={(state) =>
            cn(
              'absolute inset-0 grid place-content-center text-current [&_svg]:size-3',
              !state.indeterminate && 'invisible',
            )
          }
          data-slot="checkbox-indeterminate-indicator"
          keepMounted
        >
          <MinusIcon aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </span>

      {(children != null || description != null) && (
        <span
          className="flex flex-col items-start gap-0.5 overflow-hidden text-sm leading-5"
          data-slot="checkbox-text"
        >
          {children != null && (
            <span
              className="font-medium group-hover/checkbox:underline group-active/checkbox:no-underline"
              data-slot="checkbox-label"
              id={labelId}
            >
              {children}
            </span>
          )}
          {description != null && (
            <span
              className="font-normal text-muted-foreground group-active/checkbox:text-muted-foreground-strong"
              data-slot="checkbox-description"
              id={descriptionId}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </CheckboxPrimitive.Root>
  );
}

export type { CheckboxGroupProps, CheckboxProps };
export { Checkbox, CheckboxGroup, checkboxGroupVariants, checkboxVariants };
