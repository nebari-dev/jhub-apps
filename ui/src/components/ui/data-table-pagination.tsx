import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataTablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  // Hide the "X–Y of Z" label (default: shown).
  hideLabel?: boolean;
}

export function DataTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  className,
  hideLabel = false,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const start = count === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min(count, (page + 1) * rowsPerPage);

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-4 py-2 text-sm text-muted-foreground',
        className,
      )}
    >
      {hideLabel ? null : (
        <span>
          {start}–{end} of {count}
        </span>
      )}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost-secondary"
          size="icon"
          aria-label="previous page"
          data-testid="previous-page"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost-secondary"
          size="icon"
          aria-label="next page"
          data-testid="next-page"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
