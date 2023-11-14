import { AppCard } from '@src/components';
import { apps } from '@src/data/app.ts';
import { JupyterHubApp } from '@src/types/app';
import React, { useEffect, useState } from 'react';

interface AppsGridProps {
  appType?: 'My' | 'Shared';
}

export const AppsGrid = ({
  appType = 'My',
}: AppsGridProps): React.ReactElement => {
  const [currentApps, setCurrentApps] = useState<JupyterHubApp[]>(apps);

  useEffect(() => {
    if (appType === 'My') {
      setCurrentApps(apps.filter((app: JupyterHubApp) => app.shared === false));
    } else if (appType === 'Shared') {
      setCurrentApps(apps.filter((app: JupyterHubApp) => app.shared === true));
    }
  }, [appType]);
  return (
    <>
      <div className="container grid grid-cols-12 flex flex-align-center pb-12">
        <div className="col-span-1">
          <h4 className="whitespace-nowrap font-bold">{appType} Apps</h4>
        </div>
        <div className="col-span-10">
          <hr className="spacer"></hr>
        </div>
        <div className="col-span-1 flex justify-end">
          <h4 className="whitespace-nowrap font-bold">
            {currentApps.length} apps
          </h4>
        </div>
      </div>
      <div className="container grid pb-12">
        <div className="flex flex flex-row flex-wrap gap-4">
          {currentApps.map((app: JupyterHubApp) => (
            <AppCard
              id={app.id}
              key={`app-${app.id}`}
              title={app.name}
              description={app.description}
              imgUrl={app.imgUrl}
              appType={app.appType}
            />
          ))}
        </div>
      </div>
    </>
  );
};
