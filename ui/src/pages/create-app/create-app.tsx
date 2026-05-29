import { AppForm } from '@src/components';
import { Button } from '@src/components/ui/button';
import { Label } from '@src/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@src/components/ui/radio-group';
import { APP_BASE_URL } from '@src/utils/constants';
import { navigateToUrl } from '@src/utils/jupyterhub';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';

export const CreateApp = (): React.ReactElement => {
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const [deployOption, setDeployOption] = useState<string>('launcher');

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
          <h1 className="text-2xl font-bold">
            {deployOption === 'launcher'
              ? 'Deploy a new app'
              : 'Deploy an app from a Git repository'}
          </h1>
          <p className="max-w-[600px] pt-[10px] pb-[30px]">
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
          </p>
        </div>
        <div hidden={isHeadless}>
          <RadioGroup
            aria-label="deployOption"
            name="deployOption"
            value={deployOption}
            onValueChange={setDeployOption}
            className="mb-4 gap-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="launcher" id="deploy-launcher" />
              <Label htmlFor="deploy-launcher">Deploy from App Launcher</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="git" id="deploy-git" />
              <Label htmlFor="deploy-git">Deploy from Git Repository</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <AppForm isEditMode={false} deployOption={deployOption} />
        </div>
      </div>
    </div>
  );
};
