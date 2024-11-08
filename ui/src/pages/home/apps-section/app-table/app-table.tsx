import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import { Box, Button, Chip } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { StatusChip } from '@src/components';
import { JhApp } from '@src/types/jupyterhub';
import { API_BASE_URL } from '@src/utils/constants';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentApp,
  currentNotification,
  isDeleteOpen,
  isStartOpen,
  isStopOpen,
} from '../../../../store';
import './app-table.css';

interface AppTableProps {
  apps: JhApp[];
}

export const AppTable = ({ apps }: AppTableProps): React.ReactElement => {
  const [, setAppStatus] = useState('');

  const [updatedApps, setUpdatedApps] = useState<JhApp[]>(apps);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [, setCurrentApp] = useRecoilState<JhApp | undefined>(currentApp);
  const [, setIsStartOpen] = useRecoilState<boolean>(isStartOpen);
  const [, setIsStopOpen] = useRecoilState<boolean>(isStopOpen);
  const [, setIsDeleteOpen] = useRecoilState<boolean>(isDeleteOpen);
  const serverStatus = apps.map((app) => app.status);
  useEffect(() => {
    if (serverStatus) {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [serverStatus, setNotification]);

  useEffect(() => {
    setUpdatedApps(apps);
  }, [apps]);

  const getIcon = (isPublic: boolean, isShared: boolean) => {
    if (isPublic)
      return (
        <PublicRoundedIcon
          data-testid="PublicRoundedIcon"
          fontSize="small"
          className="align-vertical-center"
        />
      );
    if (isShared)
      return (
        <GroupRoundedIcon
          data-testid="GroupRoundedIcon"
          fontSize="small"
          className="align-vertical-center"
        />
      );
    return (
      <LockRoundedIcon
        data-testid="LockRoundedIcon"
        fontSize="small"
        className="align-vertical-center"
      />
    );
  };

  return (
    <>
      <Box sx={{ height: '100%', width: '100%' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="App table">
            <TableHead>
              <TableRow className="app-header">
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created by</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {updatedApps.map((app) => (
                <TableRow
                  key={app.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {getIcon(app.public, app.shared)}
                    <span className="inline relative icon-text">
                      {app.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={app.status} size="medium" />
                  </TableCell>
                  <TableCell>{app.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.framework}
                      variant="outlined"
                      size="medium"
                    />
                  </TableCell>
                  <TableCell>
                    {app.status === 'Running' ? (
                      <Button
                        onClick={() => {
                          setIsStopOpen(true);
                          setCurrentApp(app);
                        }}
                        aria-label="Stop"
                        color="inherit"
                        size="small"
                        className="action-button"
                        data-testid="StopCircleRoundedIcon"
                        disabled={app.shared}
                      >
                        <StopCircleRoundedIcon />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsStartOpen(true);
                          setCurrentApp(app);
                        }}
                        aria-label="Start"
                        color="inherit"
                        size="small"
                        className="action-button"
                        data-testid="PlayCircleRoundedIcon"
                        disabled={
                          app.status === 'Pending' || app.status === 'Unknown'
                        }
                        style={{ borderRadius: '50%', minWidth: 'none' }}
                      >
                        <PlayCircleRoundedIcon />
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        (window.location.href = `${API_BASE_URL}/edit-app?id=${app.id}`)
                      }
                      aria-label="Edit"
                      color="inherit"
                      size="small"
                      className="action-button"
                      data-testid="EditRoundedIcon"
                      disabled={app.shared}
                      style={{ borderRadius: '50%', minWidth: 'none' }}
                    >
                      <EditRoundedIcon />
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDeleteOpen(true);
                        setCurrentApp(app);
                      }}
                      aria-label="Delete"
                      color="inherit"
                      size="small"
                      className="action-button"
                      data-testid="DeleteRoundedIcon"
                      disabled={app.shared}
                      style={{ borderRadius: '50%', minWidth: 'none' }}
                    >
                      <DeleteRoundedIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
