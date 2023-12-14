import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import React, { SyntheticEvent } from 'react';

export interface ContextMenuItem {
  id: string;
  title: string;
  disabled?: boolean;
  visible?: boolean;
  onClick?: (param: SyntheticEvent) => void;
}

export interface ContextMenuProps {
  id: string;
  items: ContextMenuItem[];
}

/**
 * A tag draws attention to new or categorized content elements.
 */
export const ContextMenu = ({
  id,
  items,
}: ContextMenuProps): React.ReactElement => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="context-menu-container" id={id} tabIndex={0} ref={menuRef}>
      <EllipsisHorizontalIcon />
      <ul className={`context-menu`}>
        {items
          .filter((item) => item.visible)
          .map((item) => (
            <li key={`context-menu-item-${item.id}`}>
              <a
                className={item.disabled ? 'disabled' : ''}
                onClick={(e) => {
                  if (item.onClick && !item.disabled) {
                    item.onClick(e);
                    menuRef.current?.blur();
                  }
                }}
              >
                {item.title}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
