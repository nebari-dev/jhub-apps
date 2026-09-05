import { Alert, AlertDescription } from '@src/components/ui/alert';
import { Button, buttonVariants } from '@src/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@src/components/ui/combobox';
import { DataTablePagination } from '@src/components/ui/data-table-pagination';
import { InputWithIcon } from '@src/components/ui/input-with-icon';
import { Switch } from '@src/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@src/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';
import type { SharePermissions } from '@src/types/api';
import type { AppSharingItem } from '@src/types/form';
import type { UserState } from '@src/types/user';
import { getFullAppUrl } from '@src/utils/jupyterhub';
import { Copy, Globe, TriangleAlert, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentUser as defaultUser } from '../../store';
import './app-sharing.css';

interface AppSharingProps {
  url?: string;
  permissions?: SharePermissions;
  isPublic: boolean;
  setCurrentUserPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentGroupPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  setIsPublic: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppSharing = ({
  url,
  permissions,
  isPublic,
  setCurrentUserPermissions,
  setCurrentGroupPermissions,
  setIsPublic,
}: AppSharingProps): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [message] = useState(
    'Adding individuals or groups will allow others to access this app.',
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<
    AppSharingItem[]
  >([]);
  const [currentShare, setCurrentShare] = useState<AppSharingItem[]>([]);
  const [currentItems, setCurrentItems] = useState<AppSharingItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [selectedValue, setSelectedValue] = useState<AppSharingItem[]>([]);

  const getOptionLabel = (option: AppSharingItem) =>
    option.type === 'user' ? option.name : `${option.name} (Group)`;
  const getOptionKey = (option: AppSharingItem) =>
    `${option.type}:${option.name}`;

  const sortedPermissions = availablePermissions.sort((a, b) => {
    const labelA = getOptionLabel(a);
    const labelB = getOptionLabel(b);

    if (a.type === 'user' && b.type !== 'user') {
      return -1;
    }
    if (a.type !== 'user' && b.type === 'user') {
      return 1;
    }

    return labelA.localeCompare(labelB);
  });

  const handleShare = () => {
    if (currentShare.length > 0) {
      const allItems = [...new Set([...currentItems, ...currentShare])];
      setCurrentItems(allItems);
      setCurrentGroupPermissions(() =>
        allItems
          .filter((item) => item.type === 'group')
          .map((item) => item.name),
      );
      setCurrentUserPermissions(() =>
        allItems
          .filter((item) => item.type === 'user')
          .map((item) => item.name),
      );
    }
    setSelectedValue([]);
  };

  useEffect(() => {
    if (currentUser?.share_permissions) {
      const usersAndGroups: AppSharingItem[] = [];
      usersAndGroups.push(
        ...(currentUser.share_permissions.users.map((user) => ({
          name: user,
          type: 'user',
        })) as AppSharingItem[]),
      );
      usersAndGroups.push(
        ...(currentUser.share_permissions.groups.map((group) => ({
          name: group,
          type: 'group',
        })) as AppSharingItem[]),
      );
      setAvailablePermissions(usersAndGroups);
    }
  }, [currentUser]);

  useEffect(() => {
    if (permissions) {
      const usersAndGroups: AppSharingItem[] = [];
      usersAndGroups.push(
        ...(permissions.users.map((user) => ({
          name: user,
          type: 'user',
        })) as AppSharingItem[]),
      );
      usersAndGroups.push(
        ...(permissions.groups.map((group) => ({
          name: group,
          type: 'group',
        })) as AppSharingItem[]),
      );
      setCurrentItems(usersAndGroups);
    }
  }, [permissions]);

  const pagedItems = currentItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div id="app-sharing" className="flex flex-col">
      {currentUser?.share_permissions ? (
        <>
          <div>
            <Alert id="sharing-notification" variant="warning" className="mb-4">
              <TriangleAlert aria-hidden="true" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
          <div className="pb-2">
            <h6 className="pb-0 text-base font-normal">
              Individuals and group access
            </h6>
            <div className="flex w-full flex-row items-start gap-2 py-4">
              <div
                className="flex flex-row justify-start"
                style={{ width: 510 }}
              >
                <Combobox
                  id="share-permissions-autocomplete"
                  items={sortedPermissions}
                  value={selectedValue}
                  multiple
                  itemToStringLabel={getOptionLabel}
                  itemToStringValue={getOptionKey}
                  isItemEqualToValue={(a, b) =>
                    getOptionKey(a) === getOptionKey(b)
                  }
                  onValueChange={(value) => {
                    setCurrentShare(value);
                    setSelectedValue(value);
                  }}
                >
                  <ComboboxChips>
                    <ComboboxValue>
                      {(value: AppSharingItem[]) =>
                        value.map((item) => (
                          <ComboboxChip key={getOptionKey(item)}>
                            {getOptionLabel(item)}
                          </ComboboxChip>
                        ))
                      }
                    </ComboboxValue>
                    <ComboboxInput
                      id="share-permissions-input"
                      aria-label="Search usernames or group names"
                      placeholder={
                        selectedValue.length === 0
                          ? 'Search one or more usernames or group names'
                          : undefined
                      }
                    />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty />
                    <ComboboxList>
                      {(item: AppSharingItem) => (
                        <ComboboxItem key={getOptionKey(item)} value={item}>
                          {getOptionLabel(item)}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="my-auto flex flex-row justify-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleShare}
                  disabled={currentShare.length === 0}
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
          {currentItems.length > 0 ? (
            <div className="pb-5">
              <Table
                aria-label="Individuals and Groups"
                scrollContainerClassName="rounded-none border-0 bg-transparent"
                className="bg-transparent"
              >
                <TableBody>
                  {pagedItems.map((item) => (
                    <TableRow
                      key={item.name}
                      className="hover:bg-transparent [&>td]:h-auto [&>td]:px-2 [&>td]:py-1"
                    >
                      <TableCell className="text-base">
                        {item.name}{' '}
                        {item.type === 'group' ? (
                          <span className="font-semibold"> (Group)</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive-foreground hover:text-destructive-foreground"
                          onClick={() => {
                            setCurrentItems((prev) =>
                              prev.filter((i) => i.name !== item.name),
                            );
                            if (item.type === 'group') {
                              setCurrentGroupPermissions((prev) =>
                                prev.filter((i) => i !== item.name),
                              );
                            } else {
                              setCurrentUserPermissions((prev) =>
                                prev.filter((i) => i !== item.name),
                              );
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                count={currentItems.length}
                page={page}
                rowsPerPage={rowsPerPage}
                hideLabel
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </>
      ) : null}
      <div className="flex flex-col">
        <div className="pt-2">
          <label
            htmlFor="is-public"
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span>Public access</span>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={() => setIsPublic(!isPublic)}
            />
          </label>
        </div>
        <div className="px-4 pb-1 pt-4">
          <div className="flex flex-row items-center gap-2 pb-2">
            {isPublic ? (
              <>
                <Globe
                  className="h-6 w-6"
                  data-testid="app-sharing-icon-public"
                />
                <p className="text-base">Link sharing public</p>
              </>
            ) : (
              <>
                <Users
                  className="h-6 w-6"
                  data-testid="app-sharing-icon-restricted"
                />
                <p className="text-base">Link sharing restricted</p>
              </>
            )}
          </div>
        </div>
        <div className="pb-4 pl-4">
          {isPublic ? (
            <p className="text-sm">
              This app is accessible to{' '}
              <span className="text-destructive-foreground">
                anyone via its link and sign in is not required.
              </span>
            </p>
          ) : (
            <p className="text-sm">
              This app is accessible to you and the people added above via its
              link.
            </p>
          )}
        </div>
        {url ? (
          <div className="p-4 pt-0">
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <InputWithIcon
                id="sharing-link"
                placeholder="http://"
                aria-label="Sharing link"
                readOnly
                value={getFullAppUrl(url)}
                endIcon={
                  <TooltipTrigger
                    // Plain <button> + buttonVariants so Base UI receives the
                    // anchor ref (dropped by the registry <Button> on React 18).
                    render={
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
                          'pointer-events-auto text-muted-foreground hover:text-foreground',
                        )}
                      />
                    }
                    id="copy-to-clipboard"
                    aria-label="Copy to clipboard"
                    onClick={() => {
                      // istanbul ignore next
                      if (url && window.isSecureContext) {
                        navigator.clipboard.writeText(getFullAppUrl(url));
                        setTooltipOpen(true);
                      }
                    }}
                  >
                    <Copy />
                  </TooltipTrigger>
                }
              />
              <TooltipContent side="top">Copied to clipboard!</TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AppSharing;
