import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import './context-menu.css';
export interface ContextMenuItem {
  id: string;
  title: string;
  disabled?: boolean;
  visible?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: React.MouseEvent<any, MouseEvent>) => void;
}

export interface ContextMenuProps {
  id: string;
  items: ContextMenuItem[];
  sx?: object;
}

export const ContextMenu = ({
  id,
  items,
}: ContextMenuProps): React.ReactElement => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="context-menu" id={id} tabIndex={0} ref={menuRef}>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        ...
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            width: '151px',
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {items
          .filter((item) => item.visible)
          .map((item) => (
            <MenuItem
              key={`menu-item-${item.id}`}
              sx={{ fontSize: '12px' }}
              onClick={(e) => {
                if (!item.disabled && item.onClick) {
                  item.onClick(e);
                }
                handleClose();
              }}
              disabled={item.disabled}
            >
              {item.title}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

export default ContextMenu;
