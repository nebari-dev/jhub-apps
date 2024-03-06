import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import React from 'react';

export const CreateApp = (): React.ReactElement => {
  return (
    <div className="container">
      <div className="row breadcrumb">
        <Button
          id="back-btn"
          type="button"
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => (document.location.href = `${APP_BASE_URL}`)}
        >
          Back
        </Button>
      </div>
      <div className="row">
        <h1>Create a new app</h1>
        <p className="paragraph">
          Begin your project by entering the details below. For more information
          about creating an app,{' '}
          <a
            href="https://jhub-apps.nebari.dev/docs/reference/create-app-form"
            target="_blank"
            rel="noopener noreferrer"
            className="paragraph-link"
          >
            visit our docs
          </a>
          .
        </p>
      </div>
      <div className="row">
        <AppForm />
      </div>
    </div>
  );
};
