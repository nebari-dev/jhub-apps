import classNames from 'classnames';
import React, { ReactNode } from 'react';

export interface TagProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The children of the tag
   */
  children: ReactNode;
  /**
   * Any additional CSS classes will be added to the tag
   */
  className?: string;
}

/**
 * A tag draws attention to new or categorized content elements.
 */
export const Tag = ({
  id,
  children,
  className,
}: TagProps): React.ReactElement => {
  const classes = classNames('tag', className);

  return (
    <span id={id} className={classes}>
      {children}
    </span>
  );
};

export default Tag;
