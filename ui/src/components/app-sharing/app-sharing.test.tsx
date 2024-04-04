import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AppSharing } from '..';

describe('AppSharing', () => {
  test('renders default component successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <AppSharing
          isPublic={false}
          setIsPublic={jest.fn()}
          setCurrentUserPermissions={jest.fn()}
          setCurrentGroupPermissions={jest.fn()}
        />
      </RecoilRoot>,
    );

    expect(baseElement.querySelector('.MuiAlert-message')).toBeTruthy();
  });
});
