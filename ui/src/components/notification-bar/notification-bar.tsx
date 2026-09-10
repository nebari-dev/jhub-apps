import { Alert, AlertAction, AlertDescription } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';

type Severity = 'error' | 'warning' | 'info' | 'success';

interface NotificationBarProps {
  /**
   * The severity of the notification
   */
  severity?: Severity;
  /**
   * The message to display in the notification
   */
  message: string;
  /**
   * Callback to close the notification
   */
  onClose?: () => void;
}

// The registry Alert has no `info` variant; it maps to `default` plus the
// theme's info tokens at the call site (className is merged with cn()).
const alertVariant: Record<
  Severity,
  'destructive' | 'warning' | 'default' | 'success'
> = {
  error: 'destructive',
  warning: 'warning',
  info: 'default',
  success: 'success',
};

const severityIcon: Record<Severity, React.ReactNode> = {
  error: <CircleX aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  success: <CircleCheck aria-hidden="true" />,
};

export const NotificationBar = ({
  severity = 'error',
  message,
  onClose,
}: NotificationBarProps): React.ReactElement => {
  return (
    <div className="w-full px-[30px] pb-[25px]">
      <Alert
        id="alert-notification"
        // Notifications interrupt regardless of severity (they replace the
        // previous MUI snackbar), so keep the assertive role for all of them.
        role="alert"
        variant={alertVariant[severity]}
        data-severity={severity}
        className={cn(
          'p-3',
          severity === 'info' &&
            'border-info-foreground bg-info text-info-foreground *:data-[slot=alert-description]:text-info-foreground',
        )}
      >
        {severityIcon[severity]}
        <AlertDescription data-testid="alert-message">
          {message}
        </AlertDescription>
        {onClose ? (
          <AlertAction className="top-1.5 right-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
              className="text-current hover:bg-transparent hover:opacity-70 active:bg-transparent"
            >
              <X />
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    </div>
  );
};

export default NotificationBar;
