import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
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
        id={`context-menu-button-${id}`}
        data-testid={`context-menu-button-${id}`}
        aria-controls={open ? `context-menu-${id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreHorizRoundedIcon
          sx={{
            fontSize: '24px',
            position: 'relative',
            top: '4px',
            color: '#000000',
          }}
        />
      </Button>
      <Menu
        id={`context-menu-${id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          horizontal: 105,
          vertical: -8,
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '151px',
          },
        }}
        MenuListProps={{
          'aria-labelledby': `context-menu-button-${id}`,
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
