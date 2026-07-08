import { Alert } from '@src/components/ui/alert';
import { X } from 'lucide-react';

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
    <div className="w-full px-[30px] pb-[25px]">
      <Alert
        id="alert-notification"
        variant={severity}
        data-severity={severity}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1" data-testid="alert-message">
            {message}
          </div>
          {onClose ? (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="-mr-1 -mt-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-current opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </Alert>
    </div>
  );
};

export default NotificationBar;
