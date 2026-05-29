import { Alert } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { Combobox } from '@src/components/ui/combobox';
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
  TooltipProvider,
  TooltipTrigger,
} from '@src/components/ui/tooltip';
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

  const sortedPermissions = availablePermissions.sort((a, b) => {
    const labelA = a.type === 'user' ? a.name : `${a.name} (Group)`;
    const labelB = b.type === 'user' ? b.name : `${b.name} (Group)`;

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
            <Alert
              id="sharing-notification"
              variant="warning"
              className="relative mb-4 pl-12"
            >
              <TriangleAlert
                className="absolute left-4 top-4 h-5 w-5"
                style={{ color: '#EAB54E' }}
              />
              {message}
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
                <Combobox<AppSharingItem>
                  options={sortedPermissions}
                  value={selectedValue}
                  multiple
                  getOptionLabel={(option) =>
                    option.type === 'user'
                      ? option.name
                      : `${option.name} (Group)`
                  }
                  getOptionKey={(option) => `${option.type}:${option.name}`}
                  placeholder="Search one or more usernames or group names"
                  searchPlaceholder="Search…"
                  triggerClassName="border-input"
                  onChange={(value) => {
                    setCurrentShare(value);
                    setSelectedValue(value);
                  }}
                />
              </div>
              <div className="my-auto flex flex-row justify-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleShare}
                  disabled={currentShare.length === 0}
                  className="h-[42px] px-[22px] py-2"
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
          {currentItems.length > 0 ? (
            <div className="pb-5">
              <Table aria-label="Individuals and Groups">
                <TableBody>
                  {pagedItems.map((item) => (
                    <TableRow
                      key={item.name}
                      className="hover:bg-transparent [&>td]:border-0 [&>td]:px-2 [&>td]:py-1"
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
                          className="text-destructive font-semibold text-sm hover:bg-transparent hover:text-destructive"
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
              <span className="text-destructive">
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
            <TooltipProvider>
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <InputWithIcon
                  id="sharing-link"
                  placeholder="http://"
                  aria-label="Sharing link"
                  readOnly
                  value={getFullAppUrl(url)}
                  endIcon={
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        id="copy-to-clipboard"
                        aria-label="Copy to clipboard"
                        className="pointer-events-auto inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          // istanbul ignore next
                          if (url && window.isSecureContext) {
                            navigator.clipboard.writeText(getFullAppUrl(url));
                            setTooltipOpen(true);
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                  }
                />
                <TooltipContent side="top">Copied to clipboard!</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AppSharing;
