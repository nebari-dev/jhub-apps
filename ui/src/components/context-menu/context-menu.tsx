import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { getFriendlyDateStr } from '@src/utils/jupyterhub';
import * as React from 'react';
import './context-menu.css';
export interface ContextMenuItem {
  id: string;
  title: string;
  disabled?: boolean;
  visible?: boolean;
  danger?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: React.MouseEvent<any, MouseEvent>) => void;
}

export interface ContextMenuProps {
  id: string;
  lastModified?: Date;
  items: ContextMenuItem[];
  sx?: object;
}

export const ContextMenu = ({
  id,
  lastModified,
  items,
}: ContextMenuProps): React.ReactElement => {
  const theme = useTheme();
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
        title="Menu options"
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
          horizontal: 134,
          vertical: -8,
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '180px',
          },
        }}
        MenuListProps={{
          'aria-labelledby': `context-menu-button-${id}`,
        }}
      >
        {lastModified && (
          <MenuItem
            sx={{
              fontSize: '12px',
              color: theme.palette.text.secondary,
            }}
          >
            {`Modified ${getFriendlyDateStr(lastModified)}`}
          </MenuItem>
        )}
        {lastModified && <Divider />}
        {items
          .filter((item) => item.visible)
          .map((item) => (
            <MenuItem
              key={`menu-item-${item.id}`}
              sx={{
                fontSize: '12px',
                color: item.danger ? theme.palette.error.main : 'inherit',
              }}
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
