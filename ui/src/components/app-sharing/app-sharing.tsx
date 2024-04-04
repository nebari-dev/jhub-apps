import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
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
  const [currentShare, setCurrentShare] = useState('');
  const [currentItems, setCurrentItems] = useState<AppSharingItem[]>([]);

  const handleShare = () => {
    const currentShareName = currentShare.split(' ')[0];
    if (currentShareName) {
      const isGroup = currentShare.split(' ').length > 1;
      setCurrentItems((prev) => [
        ...prev,
        { name: currentShareName, type: isGroup ? 'group' : 'user' },
      ]);
      if (isGroup) {
        setCurrentGroupPermissions((prev) => [...prev, currentShareName]);
      } else {
        setCurrentUserPermissions((prev) => [...prev, currentShareName]);
      }
    }
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
    <Box>
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
                sx={{ width: 470 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search one or more usernames or group names"
                  />
                )}
                onInputChange={(event, value) => {
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
                disabled={!currentShare}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Item>
        {currentItems ? (
          <Item sx={{ pb: '20px' }}>
            <TableContainer component={Paper}>
              <Table aria-label="Individuals and Groups" size="small">
                <TableBody>
                  {currentItems.map((item) => (
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
                </TableBody>
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
