import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
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
const getMenuItemIcon = (id: string) => {
  switch (id) {
    case 'start':
      return (
        <PlayCircleFilledRoundedIcon fontSize="small" sx={{ marginRight: 1 }} />
      );
    case 'stop':
      return <StopCircleRoundedIcon fontSize="small" sx={{ marginRight: 1 }} />;
    case 'edit':
      return <EditRoundedIcon fontSize="small" sx={{ marginRight: 1 }} />;
    case 'delete':
      return <DeleteRoundedIcon fontSize="small" sx={{ marginRight: 1 }} />;
    default:
      return null;
  }
};
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
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
    event.stopPropagation();
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
                  e.stopPropagation();
                  item.onClick(e);
                }
                handleClose(e);
              }}
              disabled={item.disabled}
            >
              {getMenuItemIcon(item.id)}
              {item.title}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

export default ContextMenu;
