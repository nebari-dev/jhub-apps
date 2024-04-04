import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
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
  useTheme,
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
  const theme = useTheme();
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
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
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
    'Warning: adding individuals or groups will allow others to access this app.',
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<
    AppSharingItem[]
  >([]);
  const [currentShare, setCurrentShare] = useState<AppSharingItem[]>([]);
  const [currentItems, setCurrentItems] = useState<AppSharingItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - currentItems.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get users and groups available to the current user
  useEffect(() => {
    if (currentUser) {
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
        <Item>
          <Alert
            id="sharing-notification"
            severity="warning"
            sx={{ mb: '16px' }}
          >
            {message}
          </Alert>
        </Item>
        <Item sx={{ pb: '8px' }}>
          <Typography variant="body1" sx={{ pb: '4px' }}>
            Individuals and group access
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              gap: '8px',
              pb: '16px',
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
                options={availablePermissions}
                getOptionLabel={(option) =>
                  option.type === 'user'
                    ? option.name
                    : `${option.name} (Group)`
                }
                multiple
                disableCloseOnSelect
                limitTags={2}
                sx={{ width: 470 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search one or more usernames or group names"
                  />
                )}
                onChange={(event, value) => {
                  if (event && value) {
                    setCurrentShare(value);
                  }
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleShare}
                disabled={currentShare.length === 0}
                sx={{ height: '56px' }}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Item>
        {currentItems.length > 0 ? (
          <Item sx={{ pb: '20px' }}>
            <TableContainer component={Paper}>
              <Table aria-label="Individuals and Groups" size="small">
                <TableBody>
                  {(rowsPerPage > 0
                    ? currentItems.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                    : rows
                  ).map((item) => (
                    <TableRow
                      key={item.name}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="td" scope="row">
                        {item.name} {item.type === 'group' ? ' (Group)' : <></>}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="text"
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
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}
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
                      page
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
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      ActionsComponent={TablePaginationActions}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Item>
        ) : (
          <></>
        )}
        <Item sx={{ pb: '16px' }}>
          <Box component={Paper}>
            <Stack direction="column">
              <Item sx={{ pt: '8px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      id="is_public"
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
                          fontSize: '20px',
                          position: 'relative',
                          top: '1px',
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
                          fontSize: '20px',
                          position: 'relative',
                          top: '1px',
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
                      color="primary"
                    >
                      anyone with the link.
                    </Typography>
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    This app is accessible to you and the people added above.
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
                                onClick={() => {
                                  if (url) {
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
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};

export default AppSharing;
