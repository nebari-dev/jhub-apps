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
  /**
   * Callback to close the notification
   */
  onClose?: () => void;
}

export const NotificationBar = ({
  severity = 'error',
  message,
  onClose,
}: NotificationBarProps): React.ReactElement => {
  return (
    <div className="alert-wrapper">
      {message ? (
        <Alert id="alert-notification" severity={severity} onClose={onClose}>
          {message}
        </Alert>
      ) : (
        <></>
      )}
    </div>
  );
};

export default NotificationBar;
