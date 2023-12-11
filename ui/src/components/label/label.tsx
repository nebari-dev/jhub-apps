import React, { ReactNode } from 'react';

export interface LabelProps {
  /**
   * The HTML element that this is labeling
   */
  htmlFor?: string;
  /**
   * A boolean indicating whether or not the field is required
   */
  required?: boolean;
  /**
   * The contents of the label
   */
  children: ReactNode;
}

/**
 * Defines a label for an HTML element.
 */
export const Label = ({
  htmlFor,
  required,
  children,
  ...props
}: LabelProps & JSX.IntrinsicElements['label']): React.ReactElement => {
  return (
    <label className="label" htmlFor={htmlFor} {...props}>
      {children}
      {required && <span className="text-red"> *</span>}
    </label>
  );
};

export default Label;
