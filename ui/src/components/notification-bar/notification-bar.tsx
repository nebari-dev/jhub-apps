import { Alert } from '@mui/material';
import './notification-bar.css';

interface NotificationBarProps {
  /**
   * The severity of the notification
   */
  severity?: 'error' | 'warning' | 'info' | 'success';
  /**
   * The message to display in the notification
   */
  message: string;
}

export const NotificationBar = ({
  severity = 'error',
  message,
}: NotificationBarProps): React.ReactElement => {
  return (
    <div className="alert-wrapper">
      {message ? (
        <Alert id="alert-notification" severity={severity}>
          {message}
        </Alert>
      ) : (
        <></>
      )}
    </div>
  );
};

export default NotificationBar;
