import { StatusChip } from '@src/components';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/components/ui/table';
import type { JhApp } from '@src/types/jupyterhub';
import { API_BASE_URL } from '@src/utils/constants';
import {
  CirclePlay,
  CircleStop,
  Globe,
  Lock,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentApp,
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
  const [, setCurrentApp] = useRecoilState<JhApp | undefined>(currentApp);
  const [, setIsStartOpen] = useRecoilState<boolean>(isStartOpen);
  const [, setIsStopOpen] = useRecoilState<boolean>(isStopOpen);
  const [, setIsDeleteOpen] = useRecoilState<boolean>(isDeleteOpen);
  const serverStatus = apps.map((app) => app.status);
  useEffect(() => {
    if (serverStatus) {
      setAppStatus(serverStatus.join(', '));
    }
  }, [serverStatus]);

  useEffect(() => {
    setUpdatedApps(apps);
  }, [apps]);

  const getIcon = (isPublic: boolean, isShared: boolean) => {
    if (isPublic) {
      return (
        <Globe
          data-testid="public-icon"
          className="inline-block h-4 w-4 align-middle"
        />
      );
    }
    if (isShared) {
      return (
        <Users
          data-testid="group-icon"
          className="inline-block h-4 w-4 align-middle"
        />
      );
    }
    return (
      <Lock
        data-testid="lock-icon"
        className="inline-block h-4 w-4 align-middle"
      />
    );
  };

  return (
    <div className="h-full w-full">
      <div className="rounded-md border border-border bg-background shadow-lg">
        <Table aria-label="App table" className="min-w-[650px]">
          <TableHeader>
            <TableRow className="app-header">
              <TableHead className="font-semibold text-foreground">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Created by
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Tags
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updatedApps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  {getIcon(app.public, app.shared)}
                  <span className="icon-text inline relative">{app.name}</span>
                </TableCell>
                <TableCell>
                  <StatusChip status={app.status} size="medium" />
                </TableCell>
                <TableCell>{app.username}</TableCell>
                <TableCell>
                  <Badge variant="outline">{app.framework}</Badge>
                </TableCell>
                <TableCell>
                  {app.status === 'Running' ? (
                    <Button
                      onClick={() => {
                        setIsStopOpen(true);
                        setCurrentApp(app);
                      }}
                      aria-label="Stop"
                      variant="ghost"
                      size="icon"
                      className="action-button mx-4 min-w-0 rounded-full"
                      data-testid="stop-button"
                      disabled={app.shared}
                    >
                      <CircleStop />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsStartOpen(true);
                        setCurrentApp(app);
                      }}
                      aria-label="Start"
                      variant="ghost"
                      size="icon"
                      className="action-button mx-4 min-w-0 rounded-full"
                      data-testid="start-button"
                      disabled={
                        app.status === 'Pending' || app.status === 'Unknown'
                      }
                    >
                      <CirclePlay />
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      (window.location.href = `${API_BASE_URL}/edit-app?id=${app.id}`)
                    }
                    aria-label="Edit"
                    variant="ghost"
                    size="icon"
                    className="action-button mx-4 min-w-0 rounded-full"
                    data-testid="edit-button"
                    disabled={app.shared}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDeleteOpen(true);
                      setCurrentApp(app);
                    }}
                    aria-label="Delete"
                    variant="ghost"
                    size="icon"
                    className="action-button mx-4 min-w-0 rounded-full"
                    data-testid="delete-button"
                    disabled={app.shared}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
