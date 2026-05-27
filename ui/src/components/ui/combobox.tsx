import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@src/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@src/components/ui/popover';
import { cn } from '@src/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

export interface ComboboxProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionKey?: (option: T) => string;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  onSearchChange?: (search: string) => void;
}

export function Combobox<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionKey,
  placeholder = 'Select…',
  emptyMessage = 'No results.',
  searchPlaceholder = 'Search…',
  multiple = false,
  className,
  triggerClassName,
  disabled,
  loading,
  loadingMessage = 'Loading…',
  onSearchChange,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const keyFor = React.useCallback(
    (option: T) => getOptionKey?.(option) ?? getOptionLabel(option),
    [getOptionKey, getOptionLabel],
  );
  const selectedKeys = React.useMemo(
    () => new Set(value.map(keyFor)),
    [value, keyFor],
  );

  const toggle = (option: T) => {
    const key = keyFor(option);
    if (multiple) {
      onChange(
        selectedKeys.has(key)
          ? value.filter((v) => keyFor(v) !== key)
          : [...value, option],
      );
    } else {
      onChange(selectedKeys.has(key) ? [] : [option]);
      setOpen(false);
    }
  };

  const remove = (option: T) => {
    const key = keyFor(option);
    onChange(value.filter((v) => keyFor(v) !== key));
  };

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal border-input text-foreground hover:bg-background min-h-10 h-auto py-2',
              triggerClassName,
            )}
          >
            <div className="flex flex-wrap gap-1 items-center">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : multiple ? (
                value.map((option) => (
                  <Badge
                    key={keyFor(option)}
                    variant="secondary"
                    className="gap-1"
                  >
                    {getOptionLabel(option)}
                    <button
                      type="button"
                      aria-label={`Remove ${getOptionLabel(option)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(option);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          remove(option);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{getOptionLabel(value[0])}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align="start"
        >
          <Command shouldFilter={!onSearchChange}>
            <CommandInput
              placeholder={searchPlaceholder}
              onValueChange={onSearchChange}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? loadingMessage : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const key = keyFor(option);
                  const selected = selectedKeys.has(key);
                  const label = getOptionLabel(option);
                  return (
                    <CommandItem
                      key={key}
                      value={label}
                      onSelect={() => toggle(option)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
