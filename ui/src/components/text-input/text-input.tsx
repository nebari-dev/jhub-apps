import classnames from 'classnames';
import React, { ChangeEventHandler } from 'react';

export interface TextInputProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The name of the text input
   */
  name?: string;
  /**
   * The type of input to display
   */
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
  /**
   * Custom callback for when input is changed
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

/**
 * A text input allows users to enter any combination of letters, numbers, or symbols.
 */
export const TextInput = ({
  id,
  name,
  className,
  type,
  onChange,
  ...props
}: TextInputProps & JSX.IntrinsicElements['input']): React.ReactElement => {
  const classes = classnames('text-input p-2', className);
  return (
    <input
      id={id}
      name={name}
      className={classes}
      type={type}
      onChange={onChange}
      {...props}
    />
  );
};

export default TextInput;
