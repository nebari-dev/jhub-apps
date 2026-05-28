import { cn } from '@src/lib/utils';
import type React from 'react';
import { Children, type ReactNode } from 'react';

export interface ButtonGroupProps {
  /**
   * The unique identifier for this component
   */
  id?: string;
  /**
   * A custom class to apply to the component
   */
  className?: string;
  /**
   * The contents of the label
   */
  children?: ReactNode;
}

/**
 * A button group collects similar or related actions.
 */
export const ButtonGroup = ({
  id = undefined,
  className,
  children,
}: ButtonGroupProps): React.ReactElement => {
  return (
    <ul id={id} className={cn('flex flex-row justify-end', className)}>
      {Children.map(children, (child: ReactNode, index) => {
        return (
          <li key={index} className="m-1 list-none">
            {child}
          </li>
        );
      })}
    </ul>
  );
};

export default ButtonGroup;
