import classnames from 'classnames';
import React, { ReactNode, SyntheticEvent } from 'react';

export interface ButtonProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The type of button to display
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * The style variant of button to display
   */
  variant?: 'primary' | 'secondary';
  /**
   * A custom class to apply to the component
   */
  className?: string;
  /**
   * Custom callback for when button is clicked
   */
  onClick?: (param: SyntheticEvent) => void;
  /**
   * The contents of the button
   */
  children?: ReactNode;
}

/**
 * A button draws attention to important actions with a large selectable surface.
 */
export const Button = ({
  id,
  type = 'button',
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps & JSX.IntrinsicElements['button']): React.ReactElement => {
  const classes = classnames(
    'btn rounded border-2 font-bold whitespace-nowrap',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
    },
    className,
  );

  return (
    <button id={id} type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
