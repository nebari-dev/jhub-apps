import classnames from 'classnames';
import React from 'react';

export interface AlertProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The type of alert to display
   */
  type?: 'info' | 'warning' | 'error' | 'success';
  /**
   * The body of the alert
   */
  children?: React.ReactNode;
}

/**
 * An alert keeps users informed of important and sometimes time-sensitive changes.
 */
export const Alert = ({
  id,
  type = 'info',
  children,
}: AlertProps): React.ReactElement => {
  const classes = classnames('alert', {
    'alert-success': type === 'success',
    'alert-warning': type === 'warning',
    'alert-error': type === 'error',
    'alert-info': type === 'info',
  });

  return (
    <div id={id} className={classes}>
      <div className="alert-body">
        <p className="alert-text">{children}</p>
      </div>
    </div>
  );
};

export default Alert;
