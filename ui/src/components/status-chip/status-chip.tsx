import { Badge } from '@src/components/ui/badge';
import { cn } from '@src/lib/utils';
import type { JhApp } from '@src/types/jupyterhub';
import { useRecoilState } from 'recoil';
import { currentApp, isStopOpen } from '../../store';

// Filled-circle-with-cutout-stop, matching MUI's StopCircleRounded. The inner
// rounded-square subpath winds opposite the outer circle, so non-zero fill
// punches it out and the badge color shows through.
const StopCircleFilled = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 14H9c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1z" />
  </svg>
);

interface StatusChipProps {
  status: string;
  additionalInfo?: string;
  app?: JhApp;
  size?: 'small' | 'medium';
}

// Tailwind utilities, not inline styles: the config sets `important: true`
// (to beat JupyterHub's Bootstrap), so the Badge variant's `bg-primary` would
// override an inline `backgroundColor`. Returning classes lets twMerge drop the
// default variant's color utilities and apply the status color instead.
const getStatusClasses = (status: string): string => {
  switch (status) {
    case 'Ready':
      // Green outline in light mode; in dark mode a neutral light-gray outline
      // pill with light text reads more cleanly on the dark card background.
      return 'bg-card text-[rgb(46,125,50)] border-[rgb(46,125,50)] hover:bg-card dark:bg-card dark:text-foreground dark:border-muted-foreground';
    case 'Pending':
      return 'bg-[rgb(234,181,78)] text-black border-transparent hover:bg-[rgb(234,181,78)]';
    case 'Running':
      return 'bg-[rgb(46,125,50)] text-white border-transparent hover:bg-[rgb(46,125,50)]';
    default:
      return 'bg-[rgb(121,121,124)] text-white border-transparent hover:bg-[rgb(121,121,124)]';
  }
};

export const StatusChip = ({
  status,
  additionalInfo,
  app,
  size = 'small',
}: StatusChipProps): React.ReactElement => {
  const [, setCurrentApp] = useRecoilState<JhApp | undefined>(currentApp);
  const [, setIsStopOpen] = useRecoilState<boolean>(isStopOpen);

  const hasStopButton =
    status === 'Running' && !!additionalInfo && !!app && !app.shared;

  const sizeClasses =
    size === 'medium' ? 'h-8 px-3 text-sm' : 'h-6 px-2.5 text-xs';

  return (
    <Badge
      data-testid="status-chip"
      data-status={status}
      className={cn(
        'font-semibold rounded-full',
        getStatusClasses(status),
        sizeClasses,
        hasStopButton ? 'pr-1' : '',
      )}
    >
      {status === 'Running' && additionalInfo ? (
        app && !app.shared ? (
          <>
            <span>
              {status} on {additionalInfo}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setCurrentApp(app);
                setIsStopOpen(true);
              }}
              aria-label="Stop"
              data-testid="status-chip-stop"
              className="ml-1.5 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={app.shared}
            >
              <StopCircleFilled className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span>{status}</span>
        )
      ) : (
        status || 'Default'
      )}
    </Badge>
  );
};
export default StatusChip;
