import { buttonVariants } from '@src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
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
      return <Play aria-hidden="true" />;
    case 'stop':
      return <Square aria-hidden="true" />;
    case 'edit':
      return <Pencil aria-hidden="true" />;
    case 'delete':
      return <Trash2 aria-hidden="true" />;
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
      {/* Non-modal like the header menus: the page stays scrollable. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          // Base UI anchors and focuses the menu through the trigger's ref.
          // Under React 18 a ref given to the registry's function-component
          // <Button> is dropped, so render a plain <button> styled with
          // buttonVariants instead.
          render={
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
                "rounded-full bg-transparent text-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-5",
              )}
            />
          }
          variant="ghost"
          id={`context-menu-button-${id}`}
          data-testid={`context-menu-button-${id}`}
          title="Menu options"
          aria-label="Menu options"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            id={`context-menu-${id}`}
            side="bottom"
            align="end"
            sideOffset={4}
            aria-labelledby={`context-menu-button-${id}`}
            className="w-[180px] min-w-0"
          >
            {lastModified && (
              <>
                <DropdownMenuItem
                  disabled
                  className="text-xs text-muted-foreground"
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
                  variant={item.danger ? 'destructive' : 'default'}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!item.disabled && item.onClick) {
                      item.onClick(event);
                    }
                  }}
                  className={cn('text-xs [&_svg]:size-4')}
                >
                  {getMenuItemIcon(item.id)}
                  {item.title}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
};

export default ContextMenu;
