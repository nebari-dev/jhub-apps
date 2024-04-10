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
import React, { SetStateAction, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification } from '../../../../store';
import './app-table.css';

// Define the props for AppTable
interface AppTableProps {
  apps: JhApp[];
  onStartOpen: (app: SetStateAction<null>) => void;
  onStopOpen: (app: SetStateAction<null>) => void;
  onDeleteOpen: (app: null) => void;
}

export const AppTable = ({
  apps,
  onStartOpen,
  onStopOpen,
  onDeleteOpen,
}: AppTableProps): React.ReactElement => {
  const [, setAppStatus] = useState('');
  const [currentApp, setCurrentApp] = useState<JhApp | null>(null);

  const [updatedApps, setUpdatedApps] = useState<JhApp[]>(apps);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const serverStatus = apps.map((app) => app.status);
  useEffect(() => {
    if (!serverStatus) {
      setNotification('Server status id undefined.');
    } else {
      setAppStatus(serverStatus.join(', ')); // Convert the array of strings to a single string
    }
  }, [serverStatus, setNotification]);

  useEffect(() => {
    setUpdatedApps(apps);
  }, [apps]);

  const getIcon = (isPublic: boolean, isShared: boolean) => {
    if (isPublic)
      return (
        <PublicRoundedIcon data-testid="PublicRoundedIcon" fontSize="small" />
      );
    if (isShared)
      return (
        <GroupRoundedIcon data-testid="GroupRoundedIcon" fontSize="small" />
      );
    return <LockRoundedIcon data-testid="LockRoundedIcon" fontSize="small" />;
  };

  function setCurrentApp(app: JhApp) {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <Box sx={{ height: '100%', width: '100%' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="App table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Created by</TableCell>
                <TableCell align="right">Tags</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                  <TableCell align="right">
                    <StatusChip status={app.status} />
                  </TableCell>
                  <TableCell align="right">{app.username}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={app.framework}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {app.status === 'Stopped' || app.status === 'Ready' ? (
                      <Button
                        onClick={() => {
                          onStartOpen(app);
                        }}
                        color="inherit"
                        size="small"
                        className="action-button"
                        data-testid="PlayCircleRoundedIcon"
                      >
                        <PlayCircleRoundedIcon />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          onStopOpen(true);
                          setCurrentApp(app);
                        }}
                        color="inherit"
                        size="small"
                        className="action-button"
                        data-testid="StopCircleRoundedIcon"
                      >
                        <StopCircleRoundedIcon />
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        (window.location.href = `${API_BASE_URL}/edit-app?id=${app.id}`)
                      }
                      color="inherit"
                      size="small"
                      className="action-button"
                      data-testid="EditRoundedIcon"
                    >
                      <EditRoundedIcon />
                    </Button>
                    <Button
                      onClick={() => {
                        onDeleteOpen(true);
                        setCurrentApp(app);
                      }}
                      color="inherit"
                      size="small"
                      className="action-button"
                      data-testid="DeleteRoundedIcon"
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
