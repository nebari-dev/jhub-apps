import { AppForm } from '@src/components';
import { APP_BASE_URL } from '@src/utils/constants';
import React from 'react';

export const CreateApp = (): React.ReactElement => {
  return (
    <div className="container">
      <div className="row">
        <h1>Create a new app</h1>
        <p className="paragraph">
          Begin your project by entering the details below. For more information
          about creating an app,{' '}
          <span>
            <a
              href="https://www.nebari.dev/docs/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="paragraph-link"
            >
              visit our docs
            </a>
          </span>
        </p>
      </div>
      <div className="row">
        <AppForm
          onCancel={() => (document.location.href = `${APP_BASE_URL}`)}
        />
      </div>
    </div>
  );
};
