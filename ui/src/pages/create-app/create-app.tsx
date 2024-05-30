import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Stack } from '@mui/material';
import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import React from 'react';
import { StyledFormHeading } from '../../styles/styled-form-heading';
import { StyledFormParagraph } from '../../styles/styled-form-paragraph';
import { Item } from '../../styles/styled-item';

export const CreateApp = (): React.ReactElement => {
  return (
    <Box className="container">
      <Stack>
        <Item>
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
          <StyledFormHeading>Create a new app</StyledFormHeading>
          <StyledFormParagraph>
            Begin your project by entering the details below. For more
            information about creating an app,{' '}
            <a
              href="https://jhub-apps.nebari.dev/docs/reference/create-app-form"
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
