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
        <p>
          Edit your app details here. For more information on editing your app,{' '}
          <span>
            <a
              href="https://www.nebari.dev/docs/welcome"
              target="_blank"
              rel="noopener noreferrer"
            >
              visit our docs
            </a>
          </span>
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
