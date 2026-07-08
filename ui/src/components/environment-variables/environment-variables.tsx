import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import type { KeyValuePair } from '@src/types/api';
import { Plus, X } from 'lucide-react';
import type React from 'react';
import { type ChangeEvent, useEffect, useState } from 'react';

export interface EnvironmentVariablesProps {
  variables: string | null;
  setVariables: React.Dispatch<React.SetStateAction<string | null>>;
}

export const EnvironmentVariables = ({
  variables,
  setVariables,
}: EnvironmentVariablesProps): React.ReactElement => {
  const [rows, setRows] = useState<KeyValuePair[]>([]);
  const getVariables = (values: KeyValuePair[]) => {
    if (!values || values.length === 0) {
      return null;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const newVariables = {} as any;
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
    setRows([...rows, { key: '', value: '' }]);
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
        for (const [key, value] of Object.entries(variables)) {
          newRows.push({ key, value });
        }
        return newRows;
      });
    }
  }, [variables, rows.length]);

  return (
    <div id="environment-variables" className="flex flex-col">
      {rows.length > 0 ? (
        <div className="pb-4">
          {rows.map((row, index) => (
            <div
              key={`environment-variable-row-${index}`}
              className="flex flex-row items-end gap-2 pb-4"
            >
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
