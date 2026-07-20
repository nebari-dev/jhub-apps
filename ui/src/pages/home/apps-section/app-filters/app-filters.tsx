import { ButtonGroup } from '@src/components';
import { Button } from '@src/components/ui/button';
import { Checkbox } from '@src/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@src/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@src/components/ui/radio-group';
import { Separator } from '@src/components/ui/separator';
import type { AppFrameworkProps, ServersData } from '@src/types/api';
import type { JhApp } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import {
  OWNERSHIP_TYPES,
  SERVER_STATUSES,
  SORT_TYPES,
} from '@src/utils/constants';
import { filterAndSortApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  LayoutGrid,
  Rows3,
  SortAsc,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentFrameworks as defaultFrameworks,
  currentGroups as defaultGroups,
  currentOwnershipValue as defaultOwnershipValue,
  currentSearchValue as defaultSearchValue,
  currentServerStatuses as defaultServerStatuses,
  currentSortValue as defaultSortValue,
} from '../../../../store';
import './app-filters.css';

interface AppFiltersProps {
  data: ServersData;
  currentUser: UserState;
  setApps: React.Dispatch<React.SetStateAction<JhApp[]>>;
  isGridViewActive: boolean;
  toggleView: () => void;
}

export const AppFilters = ({
  data,
  currentUser,
  isGridViewActive,
  toggleView,
  setApps,
}: AppFiltersProps): React.ReactElement => {
  const [currentSearchValue] = useRecoilState<string>(defaultSearchValue);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortByOpen, setSortByOpen] = useState(false);
  const [currentFrameworks, setCurrentFrameworks] =
    useRecoilState<string[]>(defaultFrameworks);
  const [currentOwnershipValue, setCurrentOwnershipValue] = useRecoilState(
    defaultOwnershipValue,
  );
  const [currentSortValue, setCurrentSortValue] =
    useRecoilState(defaultSortValue);
  const [currentServerStatuses, setCurrentServerStatuses] = useRecoilState<
    string[]
  >(defaultServerStatuses);
  const [currentGroups, setCurrentGroups] =
    useRecoilState<string[]>(defaultGroups);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<
    AppFrameworkProps[],
    { message: string }
  >({
    queryKey: ['app-frameworks'],
    queryFn: () =>
      axios.get('/frameworks/').then((response) => {
        return response.data;
      }),
  });

  const toggleInList = (
    list: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.includes(value)) {
      setter((prev) => prev.filter((item) => item !== value));
    } else {
      setter((prev) => [...prev, value]);
    }
  };

  const handleSortByClick = (value: string) => {
    setCurrentSortValue(value);
    setApps(
      filterAndSortApps(
        data,
        currentUser,
        currentSearchValue,
        currentOwnershipValue,
        currentFrameworks,
        value,
        currentServerStatuses,
        currentGroups,
      ),
    );
    setSortByOpen(false);
  };

  const handleApplyFilters = () => {
    setFiltersOpen(false);
    setApps(
      filterAndSortApps(
        data,
        currentUser,
        currentSearchValue,
        currentOwnershipValue,
        currentFrameworks,
        currentSortValue,
        currentServerStatuses,
        currentGroups,
      ),
    );
  };
  const handleClearFilters = () => {
    setCurrentFrameworks([]);
    setCurrentOwnershipValue('Any');
    setCurrentServerStatuses([]);
    setCurrentGroups([]);
  };

  const calculateFilteredCount = useCallback(() => {
    const filteredApps = filterAndSortApps(
      data,
      currentUser,
      currentSearchValue,
      currentOwnershipValue,
      currentFrameworks,
      currentSortValue,
      currentServerStatuses,
      currentGroups,
    );
    return filteredApps.length;
  }, [
    data,
    currentUser,
    currentSearchValue,
    currentOwnershipValue,
    currentFrameworks,
    currentSortValue,
    currentServerStatuses,
    currentGroups,
  ]);

  useEffect(() => {
    if (data) {
      const allGroups = new Set<string>();
      const allApps = [...(data.user_apps || []), ...(data.shared_apps || [])];
      allApps.forEach((app) => {
        if (app.user_options?.share_with?.groups) {
          app.user_options.share_with.groups.forEach((group: string) => {
            allGroups.add(group);
          });
        }
      });
      setAvailableGroups(Array.from(allGroups).sort());
    }
  }, [data]);

  useEffect(() => {
    setFilteredCount(calculateFilteredCount());
  }, [calculateFilteredCount]);

  return (
    <div className="flex flex-wrap items-center gap-4 pb-8">
      <div className="flex-1 min-w-[200px]">
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              id="filters-btn"
              variant="ghost-secondary"
              disabled={frameworksLoading || false}
              className="text-base font-semibold"
            >
              <Filter className="h-4 w-4" />
              Filters
              {filtersOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id="filters-list"
            align="start"
            className="w-[560px] p-0"
          >
            <form
              name="filters-form"
              id="filters-form"
              className="px-4 pt-4 pb-0"
            >
              <p className="filter-section-label py-4 text-sm font-semibold">
                Frameworks
              </p>
              <div className="flex flex-wrap">
                {frameworks?.map((framework) => {
                  const id = `framework-${framework.name}`;
                  const checked = currentFrameworks.includes(
                    framework.display_name,
                  );
                  return (
                    <label
                      key={framework.name}
                      htmlFor={id}
                      className="filter-item flex items-center gap-2 w-[120px] py-1 text-sm cursor-pointer"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() =>
                          toggleInList(
                            currentFrameworks,
                            framework.display_name,
                            setCurrentFrameworks,
                          )
                        }
                      />
                      {framework.display_name}
                    </label>
                  );
                })}
              </div>
              <Separator className="mt-6 mb-4" />
              <p className="filter-section-label pb-4 text-sm font-semibold">
                Server Status
              </p>
              <div className="flex flex-wrap">
                {SERVER_STATUSES.map((status) => {
                  const id = `status-${status}`;
                  const checked = currentServerStatuses.includes(status);
                  return (
                    <label
                      key={status}
                      htmlFor={id}
                      className="filter-item flex items-center gap-2 w-[120px] py-1 text-sm cursor-pointer"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() =>
                          toggleInList(
                            currentServerStatuses,
                            status,
                            setCurrentServerStatuses,
                          )
                        }
                      />
                      {status}
                    </label>
                  );
                })}
              </div>
              <Separator className="mt-6 mb-4" />
              <p className="filter-section-label pb-4 text-sm font-semibold">
                Groups
              </p>
              <div className="flex flex-wrap">
                {availableGroups.length > 0 ? (
                  availableGroups.map((group) => {
                    const id = `group-${group}`;
                    const checked = currentGroups.includes(group);
                    return (
                      <label
                        key={group}
                        htmlFor={id}
                        className="filter-item flex items-center gap-2 w-[120px] py-1 text-sm cursor-pointer"
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() =>
                            toggleInList(currentGroups, group, setCurrentGroups)
                          }
                        />
                        {group}
                      </label>
                    );
                  })
                ) : (
                  <p className="filter-section-label text-xs text-muted-foreground">
                    No groups available
                  </p>
                )}
              </div>
              <Separator className="mt-6 mb-4" />
              <p className="filter-section-label pb-4 text-sm font-semibold">
                Ownership
              </p>
              <RadioGroup
                aria-label="Ownership"
                value={currentOwnershipValue}
                onValueChange={setCurrentOwnershipValue}
                className="flex flex-row gap-4"
              >
                {OWNERSHIP_TYPES.map((value) => {
                  const id = `ownership-${value}`;
                  return (
                    <label
                      key={value}
                      htmlFor={id}
                      className="filter-item flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <RadioGroupItem value={value} id={id} />
                      {value}
                    </label>
                  );
                })}
              </RadioGroup>
              <div className="mt-4 -mx-4 bg-muted px-2 py-2">
                <ButtonGroup>
                  <Button
                    id="clear-filters-btn"
                    data-testid="clear-filters-btn"
                    variant="ghost-secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear
                  </Button>
                  <Button
                    id="apply-filters-btn"
                    variant="default"
                    size="sm"
                    onClick={handleApplyFilters}
                  >
                    Show {filteredCount} results
                  </Button>
                </ButtonGroup>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-6">
        <Popover open={sortByOpen} onOpenChange={setSortByOpen}>
          <PopoverTrigger asChild>
            <Button
              id="sort-by-btn"
              variant="ghost-secondary"
              className="text-base font-semibold"
            >
              <SortAsc className="h-4 w-4" />
              {currentSortValue}
              {sortByOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id="sort-by-list"
            align="start"
            className="w-[220px] p-4"
          >
            <form name="sort-by-form">
              <RadioGroup
                aria-label="Sort by"
                value={currentSortValue}
                onValueChange={handleSortByClick}
                className="gap-2"
              >
                {SORT_TYPES.map((value) => {
                  const id = `sort-${value}`;
                  return (
                    <label
                      key={value}
                      htmlFor={id}
                      className="filter-item flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <RadioGroupItem value={value} id={id} />
                      {value}
                    </label>
                  );
                })}
              </RadioGroup>
            </form>
          </PopoverContent>
        </Popover>

        <div className="flex items-center rounded border border-border">
          <Button
            onClick={toggleView}
            disabled={isGridViewActive}
            aria-label="Grid View"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-r-none border-r border-border ${
              isGridViewActive ? 'bg-muted' : 'bg-transparent'
            }`}
          >
            <LayoutGrid
              className={`h-4 w-4 ${
                isGridViewActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            />
          </Button>
          <Button
            onClick={toggleView}
            disabled={!isGridViewActive}
            aria-label="Table View"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-l-none ${
              !isGridViewActive ? 'bg-muted' : 'bg-transparent'
            }`}
          >
            <Rows3
              className={`h-4 w-4 ${
                !isGridViewActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
