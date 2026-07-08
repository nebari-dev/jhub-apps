import { Button } from '@src/components/ui/button';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import './stop-pending.css';

export const StopPending = (): React.ReactElement => {
  return (
    <div
      id="stop-pending"
      className="container flex flex-col items-center p-5 text-center"
    >
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-normal">
          Thank you for your patience
          <br />
          We are stopping your application, you may start it again when we have
          finished
        </h1>
        <Loader2
          role="progressbar"
          className="my-5 h-10 w-10 animate-spin text-primary"
        />
      </div>
      <div className="mt-16">
        <p className="mb-2">
          You may return to the Application Screen at any time
        </p>
        <Button id="back-btn" onClick={() => navigateToUrl(`${APP_BASE_URL}`)}>
          Back To Home
        </Button>
      </div>
    </div>
  );
};
