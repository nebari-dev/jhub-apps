import React, { ReactNode } from 'react';

export interface ErrorMessagesProps {
  /**
   * The unique identifier for this component
   */
  id?: string;
  /**
   * An array of error strings to display
   */
  errors?: string[];
  /**
   * ReactNode components to display as children
   */
  children?: ReactNode;
}

/**
 * Outputs a list of error messages as HTML.
 */
export const ErrorMessages = ({
  id = undefined,
  errors,
  children,
}: ErrorMessagesProps): React.ReactElement => {
  // If no children and items provided, render partial
  if (!children && !errors) {
    return <></>;
  }

  return (
    <>
      {children ??
        errors?.map((error, index) => {
          return (
            <span id={`${id}-${index}`} key={index} className="text-red">
              {error}
            </span>
          );
        })}
    </>
  );
};

export default ErrorMessages;
