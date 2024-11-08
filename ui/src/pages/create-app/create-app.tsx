import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import React from 'react';
import { useRecoilState } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';
import { StyledFormParagraph } from '../../styles/styled-form-paragraph';
import { Item } from '../../styles/styled-item';

export const CreateApp = (): React.ReactElement => {
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  return (
    <Box className="container">
      <Stack>
        <Item hidden={isHeadless}>
          <div className="form-breadcrumb">
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
            Deploy a new app
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
        <Item>
          <AppForm />
        </Item>
      </Stack>
    </Box>
  );
};
