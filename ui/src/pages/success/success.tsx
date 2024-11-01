import { Box, Stack, Typography } from '@mui/material';
import { UserState } from '@src/types/user';
import { APP_BASE_URL } from '@src/utils/constants';
import React, { SyntheticEvent, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { StyledFormParagraph } from 'src/styles/styled-form-paragraph';
import { Item } from 'src/styles/styled-item';
import { currentUser as defaultUser } from '../../store';

export const Success = (): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [searchParams] = useSearchParams();
  const username = currentUser?.name;
  const server = searchParams.get('id') || '';

  const handleNavigate = (event: SyntheticEvent) => {
    event.preventDefault();
    // Assume this page is only used when headless and inside an iframe
    window.parent.open(
      `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
      '_blank',
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      className="container"
      sx={{
        height: '100ch',
        display: 'flex',
      }}
    >
      <Stack>
        <Item>
          <Typography component="h1" variant="h5">
            App Submitted Successfully!
          </Typography>
          <StyledFormParagraph>
            To view the status of your app deployment, please click{' '}
            <a
              href="#"
              onClick={handleNavigate}
              className="form-paragraph-link"
            >
              here
            </a>
            .
          </StyledFormParagraph>
        </Item>
      </Stack>
    </Box>
  );
};
