import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import { Chip, IconButton } from '@mui/material';
import { JhApp } from '@src/types/jupyterhub';
import { useRecoilState } from 'recoil';
import { currentApp, isStopOpen } from '../../store';
import './status-chip.css';

interface StatusChipProps {
  status: string;
  additionalInfo?: string;
  app?: JhApp;
  size?: 'small' | 'medium';
}
const getStatusStyles = (status: string) => {
  let styles;
  switch (status) {
    case 'Ready':
      styles = {
        bgcolor: 'rgb(255, 255, 255)', // #ffffff
        border: '1px solid rgb(46, 125, 50)', // #2E7D32
        color: 'rgb(46, 125, 50)', // #2E7D32
      };
      break;
    case 'Pending':
      styles = {
        bgcolor: 'rgb(234, 181, 78)', // #EAB54E
        color: 'black',
      };
      break;
    case 'Running':
      styles = {
        bgcolor: 'rgb(46, 125, 50)', // #2E7D32
        color: 'white',
      };
      break;
    case 'Unknown':
    default:
      styles = {
        bgcolor: 'rgb(121, 121, 124)', // #79797C
        color: 'white',
      };
      break;
  }
  return styles;
};

export const StatusChip = ({
  status,
  additionalInfo,
  app,
  size = 'small',
}: StatusChipProps): React.ReactElement => {
  const [, setCurrentApp] = useRecoilState<JhApp | undefined>(currentApp);
  const [, setIsStopOpen] = useRecoilState<boolean>(isStopOpen);

  const getLabel = () => {
    if (status === 'Running' && additionalInfo) {
      return (
        <>
          {app && !app.shared ? (
            <>
              <span
                className="chip-label-info"
                style={{ position: 'relative', top: '1px' }}
              >
                {status} on {additionalInfo}
              </span>
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setCurrentApp(app);
                  setIsStopOpen(true);
                }}
                aria-label="Stop"
                sx={{
                  pl: 0,
                  position: 'relative',
                  top: 0,
                  left: '6px',
                }}
                color="inherit"
                disabled={app.shared}
              >
                <StopCircleRoundedIcon
                  sx={{
                    fontSize: '16px',
                  }}
                />
              </IconButton>
            </>
          ) : (
            <span>{status}</span>
          )}
        </>
      );
    }
    return status || 'Default';
  };

  return (
    <Chip
      label={getLabel()}
      className={
        status !== 'Running' || !additionalInfo || app?.shared
          ? 'chip-base'
          : ''
      }
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: '12px',
        ...getStatusStyles(status),
      }}
    />
  );
};
export default StatusChip;
