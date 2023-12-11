import classNames from 'classnames';
import React, { ReactNode } from 'react';

export interface FormGroupProps {
  /**
   * The unique identifier for this component
   */
  id?: string;
  /**
   * An array of string error messages
   */
  errors?: string[];
  /**
   * Additional class name for the form group
   */
  className?: string;
  /**
   * The contents of the form group
   */
  children: ReactNode;
}

/**
 * A wrapper for form elements used to provide validation formatting.
 */
export const FormGroup = ({
  id = undefined,
  errors,
  className,
  children,
}: FormGroupProps): React.ReactElement => {
  const hasErrors = !!(errors && errors.length > 0);
  const classes = classNames(
    'form-group',
    {
      'form-group-error': hasErrors,
    },
    className,
  );

  return (
    <div id={id} className={classes}>
      {children}
    </div>
  );
};

export default FormGroup;
