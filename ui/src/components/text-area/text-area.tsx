import classNames from 'classnames';
import React, { ChangeEventHandler } from 'react';

export interface TextAreaProps {
  /**
   * The unique identifier for the textarea
   */
  id: string;
  /**
   * The number of rows to render for the textarea
   */
  rows?: number;
  /**
   * Event handler for when value of textarea is changes
   */
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

/**
 * A text area allows users to enter any combination of letters, numbers, or symbols.
 */
export const TextArea = ({
  id,
  rows,
  className,
  onChange,
  ...props
}: TextAreaProps & JSX.IntrinsicElements['textarea']): React.ReactElement => {
  return (
    <textarea
      className={classNames('text-area p-2', className)}
      id={id}
      rows={rows}
      onChange={onChange}
      {...props}
    />
  );
};

export default TextArea;
