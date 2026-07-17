import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { cn } from '@src/lib/utils';
import { getFriendlyDateStr } from '@src/utils/jupyterhub';
import { MoreHorizontal, Pencil, Play, Square, Trash2 } from 'lucide-react';
import type * as React from 'react';
import './context-menu.css';

export interface ContextMenuItem {
  id: string;
  title: string;
  disabled?: boolean;
  visible?: boolean;
  danger?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export interface ContextMenuProps {
  id: string;
  lastModified?: Date;
  items: ContextMenuItem[];
}

const getMenuItemIcon = (id: string) => {
  switch (id) {
    case 'start':
      return <Play className="mr-1 h-4 w-4" />;
    case 'stop':
      return <Square className="mr-1 h-4 w-4" />;
    case 'edit':
      return <Pencil className="mr-1 h-4 w-4" />;
    case 'delete':
      return <Trash2 className="mr-1 h-4 w-4" />;
    default:
      return null;
  }
};

export const ContextMenu = ({
  id,
  lastModified,
  items,
}: ContextMenuProps): React.ReactElement => {
  return (
    <div className="context-menu" id={id}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            id={`context-menu-button-${id}`}
            data-testid={`context-menu-button-${id}`}
            title="Menu options"
            aria-label="Menu options"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-black hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          id={`context-menu-${id}`}
          side="bottom"
          align="end"
          sideOffset={4}
          aria-labelledby={`context-menu-button-${id}`}
          className="z-[9999] w-[180px]"
        >
          {lastModified && (
            <>
              <DropdownMenuItem
                disabled
                className="text-xs text-muted-foreground data-[disabled]:opacity-100"
              >
                {`Modified ${getFriendlyDateStr(lastModified)}`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {items
            .filter((item) => item.visible)
            .map((item) => (
              <DropdownMenuItem
                key={`menu-item-${item.id}`}
                disabled={item.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onSelect={(event) => {
                  if (!item.disabled && item.onClick) {
                    item.onClick(event as unknown as React.MouseEvent);
                  }
                }}
                className={cn(
                  'text-xs',
                  item.danger && 'text-destructive focus:text-destructive',
                )}
              >
                {getMenuItemIcon(item.id)}
                {item.title}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ContextMenu;
