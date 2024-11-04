import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { isHeadless as defaultIsHeadless } from '../../store';
import { CreateApp } from './create-app';

describe('CreateApp', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  const renderWithRecoilState = (isHeadlessValue: boolean) => (
    <RecoilRoot
      initializeState={({ set }) => set(defaultIsHeadless, isHeadlessValue)}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CreateApp />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  const componentWrapper = (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CreateApp />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );

  test('should render successfully', async () => {
    const { baseElement } = render(componentWrapper);
    await act(async () => {
      expect(baseElement).toBeTruthy();
      expect(baseElement.querySelector('h1')?.textContent).toEqual(
        'Deploy a new app',
      );
    });
  });

  test('clicks back to home', async () => {
    const { baseElement } = render(componentWrapper);
    const btn = baseElement.querySelector('#back-btn') as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Back To Home');
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/');
  });
  test('should update heading based on deployment option selected', async () => {
    const { baseElement, getByLabelText } = render(componentWrapper);

    // Default selected option is 'launcher'
    expect(baseElement.querySelector('h1')?.textContent).toEqual(
      'Deploy a new app',
    );

    // Select the 'git' radio button
    const gitOption = getByLabelText(
      'Deploy from Git Repository',
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.click(gitOption);
    });

    // Expect heading to change
    expect(baseElement.querySelector('h1')?.textContent).toEqual(
      'Deploy an app from a Git repository',
    );
  });

  test('should pass the selected deploy option to AppForm', () => {
    const { getByLabelText, getByText } = render(componentWrapper);

    // Select the 'git' radio button
    const gitOption = getByLabelText(
      'Deploy from Git Repository',
    ) as HTMLInputElement;
    fireEvent.click(gitOption); // No need for act since fireEvent is synchronous

    // Use getByText to immediately check for the rendered text
    const appForm = getByText(
      /Begin your project by entering the details below\./i,
    );
    expect(appForm).toBeInTheDocument();
  });

  test('should display Back To Home button and deployment options when isHeadless is false', () => {
    const { getByText, getByLabelText } = render(renderWithRecoilState(false));

    // Check that Back To Home button is visible
    expect(getByText('Back To Home')).toBeInTheDocument();

    // Check that deployment options (radio buttons) are visible
    expect(getByLabelText('Deploy from App Launcher')).toBeInTheDocument();
    expect(getByLabelText('Deploy from Git Repository')).toBeInTheDocument();
  });
});
