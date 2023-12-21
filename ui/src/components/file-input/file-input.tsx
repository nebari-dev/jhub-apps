import classnames from 'classnames';
import React from 'react';

export interface FileInputProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The name for the file input field
   */
  name?: string;
  /**
   * Whether or not to allow multiple files to be uploaded
   */
  allowMultiple?: boolean;
  /**
   * The types of files that are allowed to be uploaded
   */
  allowedFileTypes?: string;
}

/**
 * File input allows users to attach one or multiple files.
 */
export const FileInput = ({
  id,
  name,
  className,
  allowMultiple = undefined,
  allowedFileTypes = 'image/png, image/jpeg',
  ...props
}: FileInputProps & JSX.IntrinsicElements['input']): React.ReactElement => {
  const classes = classnames('file-input', className);
  return (
    <input
      id={id}
      name={name}
      className={classes}
      type="file"
      multiple={allowMultiple}
      accept={allowedFileTypes}
      {...props}
    />
  );
};

export default FileInput;
