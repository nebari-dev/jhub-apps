import { AppForm } from '@src/components';
import { Button } from '@src/components/ui/button';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';

export const EditApp = (): React.ReactElement => {
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="container">
      <div className="flex flex-col">
        <div hidden={isHeadless}>
          <div className="form-breadcrumb">
            <Button
              id="back-btn"
              type="button"
              variant="ghost"
              onClick={() => navigateToUrl(APP_BASE_URL)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Home
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Edit app</h1>
          <p className="max-w-[600px] pt-[10px] pb-[30px]">
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
          </p>
        </div>
        <div>
          {id ? <AppForm isEditMode={true} id={id} /> : <>No app found.</>}
        </div>
      </div>
    </div>
  );
};
