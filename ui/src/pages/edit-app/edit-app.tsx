import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import React from 'react';
import { useParams } from 'react-router-dom';

export const EditApp = (): React.ReactElement => {
  const param = useParams();
  return (
    <div className="container">
      <div className="row">
        <h1>Edit app</h1>
        <p className="paragraph">
          Edit your app details here. For more information on editing your app,{' '}
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
        <AppForm
          id={param.id}
          onCancel={() => (document.location.href = `${APP_BASE_URL}`)}
        />
      </div>
    </div>
  );
};
