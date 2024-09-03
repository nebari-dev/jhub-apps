import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { SharePermissions } from '@src/types/api';
import { AppSharingItem } from '@src/types/form';
import { UserState } from '@src/types/user';
import { getFullAppUrl } from '@src/utils/jupyterhub';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentUser as defaultUser } from '../../store';
import { Item } from '../../styles/styled-item';
import './app-sharing.css';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page + 1);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
        data-testid="previous-page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        data-testid="next-page"
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
}

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
  
    // First, compare by type: users first, groups second
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

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    if (event) {
      setPage(newPage);
    }
  };

  // Get users and groups available to the current user
  useEffect(() => {
    if (currentUser && currentUser.share_permissions) {
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

  // Set users and groups added to current item
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

  return (
    <Box id="app-sharing">
      <Stack direction="column">
        {currentUser?.share_permissions ? (
          <>
            <Item>
              <Alert
                id="sharing-notification"
                severity="warning"
                icon={
                  <WarningRoundedIcon
                    sx={{ color: '#EAB54E', top: '-2px', position: 'relative' }}
                  />
                }
                sx={{ mb: '16px', position: 'relative' }}
              >
                {message}
              </Alert>
            </Item>
            <Item sx={{ pb: '8px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 400, pb: 0 }}>
                Individuals and group access
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  gap: '8px',
                  py: '16px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Autocomplete
                    disablePortal
                    id="share-permissions-autocomplete"
                    options={sortedPermissions}
                    getOptionLabel={(option) =>
                      option.type === 'user'
                        ? option.name
                        : `${option.name} (Group)`
                    }
                    multiple
                    disableCloseOnSelect
                    clearOnBlur
                    limitTags={2}
                    sx={{ width: 510 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          selectedValue.length > 0
                            ? undefined
                            : 'Search one or more usernames or group names'
                        }
                      />
                    )}
                    value={selectedValue}
                    onChange={(event, value) => {
                      if (event && value) {
                        setCurrentShare(value);
                        setSelectedValue(value);
                      }
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    margin: 'auto auto',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleShare}
                    disabled={currentShare.length === 0}
                    sx={{ height: '42px', px: '22px', py: '8px' }}
                  >
                    Share
                  </Button>
                </Box>
              </Box>
            </Item>
            {currentItems.length > 0 ? (
              <Item sx={{ pb: '20px' }}>
                <Paper elevation={0}>
                  <TableContainer>
                    <Table aria-label="Individuals and Groups" size="small">
                      <TableBody>
                        {currentItems
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage,
                          )
                          .map((item) => (
                            <TableRow
                              key={item.name}
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                component="td"
                                scope="row"
                                sx={{ fontSize: '16px' }}
                              >
                                {item.name}{' '}
                                {item.type === 'group' ? (
                                  <span style={{ fontWeight: 600 }}>
                                    {' '}
                                    (Group)
                                  </span>
                                ) : (
                                  <></>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="text"
                                  color="error"
                                  size="small"
                                  sx={{ fontWeight: '600', fontSize: '14px' }}
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
                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            colSpan={2}
                            count={currentItems.length}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={[
                              5,
                              10,
                              25,
                              { label: 'All', value: -1 },
                            ]}
                            page={page}
                            showFirstButton={false}
                            showLastButton={false}
                            width="500px"
                            slotProps={{
                              select: {
                                inputProps: {
                                  'aria-label': 'rows per page',
                                  width: '500px',
                                },
                                native: false,
                              },
                            }}
                            onPageChange={handleChangePage}
                            ActionsComponent={TablePaginationActions}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </Paper>
              </Item>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
        <Item>
          <Box>
            <Paper elevation={0}>
              <Stack direction="column">
                <Item sx={{ pt: '8px' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="is-public"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                      />
                    }
                    label="Public access"
                    labelPlacement="start"
                  />
                </Item>
                <Item sx={{ px: '16px', pt: '16px', pb: '4px' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '8px',
                      pb: '8px',
                    }}
                  >
                    {isPublic ? (
                      <>
                        <PublicRoundedIcon
                          sx={{
                            fontSize: '24px',
                          }}
                        />
                        <Typography variant="body1">
                          Link sharing public
                        </Typography>
                      </>
                    ) : (
                      <>
                        <GroupRoundedIcon
                          sx={{
                            fontSize: '24px',
                          }}
                        />
                        <Typography variant="body1">
                          Link sharing restricted
                        </Typography>
                      </>
                    )}
                  </Box>
                </Item>
                <Item sx={{ pl: '16px', pb: '16px' }}>
                  {isPublic ? (
                    <Typography variant="body2">
                      This app is accessible to{' '}
                      <Typography
                        component="span"
                        variant="body2"
                        color="error"
                      >
                        anyone via its link and sign in is not required.
                      </Typography>
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      This app is accessible to you and the people added above
                      via its link.
                    </Typography>
                  )}
                </Item>
                {url ? (
                  <Item sx={{ p: '16px', pt: 0 }}>
                    <TextField
                      id="sharing-link"
                      placeholder="http://"
                      aria-label="Sharing link"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <ClickAwayListener
                              onClickAway={() => setTooltipOpen(false)}
                            >
                              <Tooltip
                                PopperProps={{
                                  disablePortal: true,
                                }}
                                onClose={() => setTooltipOpen(false)}
                                open={tooltipOpen}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title="Copied to clipboard!"
                                placement="top"
                              >
                                <IconButton
                                  id="copy-to-clipboard"
                                  onClick={() => {
                                    // istanbul ignore next
                                    if (url && window.isSecureContext) {
                                      navigator.clipboard.writeText(
                                        getFullAppUrl(url),
                                      );
                                      setTooltipOpen(true);
                                    }
                                  }}
                                >
                                  <ContentCopyRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </ClickAwayListener>
                          </InputAdornment>
                        ),
                      }}
                      value={getFullAppUrl(url)}
                    />
                  </Item>
                ) : (
                  <></>
                )}
              </Stack>
            </Paper>
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};

export default AppSharing;
