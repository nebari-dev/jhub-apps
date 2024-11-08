import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';
import { StyledFormParagraph } from '../../styles/styled-form-paragraph';
import { Item } from '../../styles/styled-item';

export const EditApp = (): React.ReactElement => {
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

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
            Edit app
          </Typography>
          <StyledFormParagraph>
            Edit your app details here. For more information on editing your
            app,{' '}
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
          <>{id ? <AppForm id={id} /> : <>No app found.</>}</>
        </Item>
      </Stack>
    </Box>
  );
};
