import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';
import { StyledFormParagraph } from '../../styles/styled-form-paragraph';
import { Item } from '../../styles/styled-item';

export const CreateApp = (): React.ReactElement => {
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const [deployOption, setDeployOption] = useState<string>('launcher'); // Track selected deployment option

  const handleDeployOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDeployOption(event.target.value);
  };
  return (
    <Box className="container">
      <Stack>
        <Item hidden={isHeadless}>
          <div className="form-breadcrumb">
            {/* Back button */}
            <Button
              id="back-btn"
              type="button"
              variant="text"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigateToUrl(APP_BASE_URL)}
            >
              Back To Home
            </Button>
          </div>
        </Item>

        <Item>
          <Typography component="h1" variant="h5">
            {deployOption === 'launcher'
              ? 'Deploy a new app'
              : 'Deploy an app from a Git repository'}
          </Typography>
          <StyledFormParagraph>
            Begin your project by entering the details below. For more
            information about deploying an app,{' '}
            <a
              href="https://jhub-apps.nebari.dev/docs/category/create-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="form-paragraph-link"
            >
              visit our docs
            </a>
            .
          </StyledFormParagraph>
        </Item>
        <Item hidden={isHeadless}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="deployOption"
              name="deployOption"
              value={deployOption}
              onChange={handleDeployOptionChange}
            >
              <FormControlLabel
                value="launcher"
                control={<Radio />}
                label="Deploy from App Launcher"
              />
              <FormControlLabel
                value="git"
                control={<Radio />}
                label="Deploy from Git Repository"
              />
            </RadioGroup>
          </FormControl>
        </Item>
        <Item>
          {/* Pass the selected deployment option to the AppForm */}
          <AppForm isEditMode={false} deployOption={deployOption} />
        </Item>
      </Stack>
    </Box>
  );
};
