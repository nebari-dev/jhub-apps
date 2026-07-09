import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import type { EnvironmentVariablesMap, KeyValuePair } from '@src/types/api';
import { Plus, X } from 'lucide-react';
import type React from 'react';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface EnvironmentVariablesProps {
  variables: EnvironmentVariablesMap | string | null;
  setVariables: React.Dispatch<
    React.SetStateAction<EnvironmentVariablesMap | null>
  >;
}

interface EnvironmentVariableRow extends KeyValuePair {
  id: string;
}

export const EnvironmentVariables = ({
  variables,
  setVariables,
}: EnvironmentVariablesProps): React.ReactElement => {
  const rowId = useRef(0);
  const [rows, setRows] = useState<EnvironmentVariableRow[]>([]);
  const createRow = useCallback(
    (key = '', value = '') => ({
      id: `environment-variable-row-${rowId.current++}`,
      key,
      value,
    }),
    [],
  );

  const getVariableEntries = useCallback(
    (value: EnvironmentVariablesProps['variables']) => {
      if (!value) {
        return [];
      }

      if (typeof value !== 'string') {
        return Object.entries(value);
      }

      try {
        const parsed: unknown = JSON.parse(value.replace(/'/g, '"'));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return Object.entries(parsed).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          );
        }
      } catch {
        return [];
      }

      return [];
    },
    [],
  );

  const getVariables = (values: KeyValuePair[]) => {
    if (!values || values.length === 0) {
      return null;
    }

    const newVariables: Record<string, string> = {};
    values.forEach((row) => {
      if (row.key) {
        newVariables[row.key] = row.value;
      }
    });
    return newVariables;
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const values = [...rows];
    if (event.target.name === 'key') {
      values[index].key = event.target.value;
    } else {
      values[index].value = event.target.value;
    }
    setRows(values);
    setVariables(getVariables(values));
  };

  const handleAddRow = () => {
    setRows([...rows, createRow()]);
  };

  const handleRemoveRow = (index: number) => {
    const values = [...rows];
    values.splice(index, 1);
    setRows(values);
    setVariables(getVariables(values));
  };

  // Only load previous variables the first time
  useEffect(() => {
    if (variables && rows.length === 0) {
      setRows(() => {
        const newRows = [];
        for (const [key, value] of getVariableEntries(variables)) {
          newRows.push(createRow(key, value));
        }
        return newRows;
      });
    }
  }, [variables, rows.length, createRow, getVariableEntries]);

  return (
    <div id="environment-variables" className="flex flex-col">
      {rows.length > 0 ? (
        <div className="pb-4">
          {rows.map((row, index) => (
            <div key={row.id} className="flex flex-row items-end gap-2 pb-4">
              <div className="flex w-full flex-col gap-1.5">
                <Label htmlFor={`environment-variable-key-${index}`}>Key</Label>
                <Input
                  id={`environment-variable-key-${index}`}
                  name="key"
                  placeholder="Key"
                  value={row.key}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, e)
                  }
                />
              </div>
              <div className="flex w-full flex-col gap-1.5">
                <Label htmlFor={`environment-variable-value-${index}`}>
                  Value
                </Label>
                <Input
                  id={`environment-variable-value-${index}`}
                  name="value"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, e)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost-secondary"
                size="icon"
                onClick={() => handleRemoveRow(index)}
                aria-label="Remove"
                data-testid="env-var-remove"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <div>
        <Button type="button" variant="secondary" onClick={handleAddRow}>
          <Plus />
          Add Variable
        </Button>
      </div>
    </div>
  );
};

export default EnvironmentVariables;
