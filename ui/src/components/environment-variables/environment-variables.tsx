import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import { Plus, X } from 'lucide-react';
import type React from 'react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

interface EnvironmentVariableRow {
  id: string;
  key: string;
  value: string;
}

export interface EnvironmentVariablesProps {
  variables: Record<string, string> | null;
  setVariables: React.Dispatch<
    React.SetStateAction<Record<string, string> | null>
  >;
}

export const EnvironmentVariables = ({
  variables,
  setVariables,
}: EnvironmentVariablesProps): React.ReactElement => {
  const [rows, setRows] = useState<EnvironmentVariableRow[]>([]);
  const nextRowId = useRef(0);
  const createRow = (key = '', value = ''): EnvironmentVariableRow => ({
    id: `environment-variable-${nextRowId.current++}`,
    key,
    value,
  });

  const getVariables = (values: EnvironmentVariableRow[]) => {
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
        const newRows: EnvironmentVariableRow[] = [];
        for (const [key, value] of Object.entries(variables)) {
          newRows.push(createRow(key, value));
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
