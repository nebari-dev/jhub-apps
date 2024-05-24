import AddIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Button, IconButton, Stack, TextField } from '@mui/material';
import { KeyValuePair } from '@src/types/api';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Item } from '../../styles/styled-item';

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
    <Box id="environment-variables">
      <Stack>
        {rows.length > 0 ? (
          <Item sx={{ pb: '16px' }}>
            {rows.map((row, index) => (
              <Stack
                direction="row"
                gap={1}
                key={`environment-variable-row-${index}`}
                sx={{ pb: '16px' }}
              >
                <Item sx={{ width: '100%' }}>
                  <TextField
                    id={`environment-variable-key-${index}`}
                    name="key"
                    label="Key"
                    placeholder="Key"
                    value={row.key}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, e)
                    }
                  />
                </Item>
                <Item sx={{ width: '100%' }}>
                  <TextField
                    id={`environment-variable-value-${index}`}
                    name="value"
                    label="Value"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, e)
                    }
                  />
                </Item>
                <Item>
                  <IconButton
                    sx={{ mt: '7px' }}
                    onClick={() => handleRemoveRow(index)}
                    aria-label="Remove"
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Item>
              </Stack>
            ))}
          </Item>
        ) : (
          <></>
        )}
        <Item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            sx={{}}
          >
            Add Variable
          </Button>
        </Item>
      </Stack>
    </Box>
  );
};

export default EnvironmentVariables;
