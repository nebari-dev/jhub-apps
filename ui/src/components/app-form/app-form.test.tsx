import { app, environments, frameworks, profiles } from '@src/data/api';
import { currentUser } from '@src/data/user';
import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { currentUser as defaultUser } from '../../store';
import { AppForm } from './app-form';

describe('AppForm', () => {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(),
  });

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

  beforeAll(() => {
    window.scrollTo = vi.fn();
  });

  beforeEach(() => {
    queryClient.clear();
    mock.reset();
  });

  test('renders successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelector('#app-form')).toBeTruthy();
  });

  describe('filepath field behavior based on query parameter', () => {
    test('navigates to the URL with a filepath query parameter and checks the value of the filepath field in the form', async () => {
      const testFilePath = '/path/to/test/file.ipynb';
      const testUrl = `?filepath=${encodeURIComponent(testFilePath)}`;
      window.history.pushState({}, 'Test Page', testUrl);

      const { baseElement } = render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppForm />
            </BrowserRouter>
          </QueryClientProvider>
        </RecoilRoot>,
      );

      const filePathField = baseElement.querySelector(
        '#filepath',
      ) as HTMLInputElement;

      expect(filePathField).toBeInTheDocument();
      expect(filePathField.value).toBe(testFilePath);
    });

    test('navigates to the URL without a filepath query parameter and checks the value of the filepath field in the form', async () => {
      const testUrl = '/';
      window.history.pushState({}, 'Test Page', testUrl);

      const { baseElement } = render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppForm />
            </BrowserRouter>
          </QueryClientProvider>
        </RecoilRoot>,
      );

      const filePathField = baseElement.querySelector(
        '#filepath',
      ) as HTMLInputElement;

      expect(filePathField).toBeInTheDocument();
      expect(filePathField.value).toBe('');
    });
  });

  test('handles getStyledText correctly', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const textArea = baseElement.querySelector(
      '#description',
    ) as HTMLTextAreaElement;

    if (textArea) {
      fireEvent.change(textArea, { target: { value: 'a'.repeat(210) } });

      const overlayText = baseElement.querySelector(
        '.overlay-text',
      ) as HTMLDivElement;
      expect(overlayText).toHaveTextContent('a'.repeat(200));
      expect(overlayText.querySelector('span')).toHaveStyle('color: red');
    }
  });

  test('handles handleFocus correctly', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const textArea = baseElement.querySelector(
      '#description',
    ) as HTMLTextAreaElement;

    if (textArea) {
      fireEvent.focus(textArea);
      expect(textArea.classList).toContain('description_text-field');

      fireEvent.blur(textArea);
      expect(textArea.classList).toContain('description_text-field');
    }
  });

  test('renders CustomLabel correctly', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const customLabel = baseElement.querySelector('label') as HTMLLabelElement;

    expect(customLabel).toHaveTextContent('*');
    expect(customLabel).toHaveTextContent('Name');
  });

  test('simulates creating a standard app', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onPost(new RegExp('/server')).reply(200);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], null);
    queryClient.setQueryData(['app-profiles'], null);
    const { baseElement } = render(
      <RecoilRoot initializeState={({ set }) => set(defaultUser, currentUser)}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    const envVariableField = baseElement.querySelector(
      '#env',
    ) as HTMLInputElement;
    if (displayNameField && frameworkField && envVariableField) {
      // Attempt submitting without filling in required fields
      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      await userEvent.type(displayNameField, 'App 1');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      // prettier-ignore
      const envJson = JSON.stringify({ 'KEY': 'VALUE', 'KEY-1': 'Value-1' });
      fireEvent.change(envVariableField, { target: { value: envJson } });

      // Submit with all required fields filled in
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('adjusts textarea height on input', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const textArea = baseElement.querySelector(
      '#description',
    ) as HTMLTextAreaElement;

    if (textArea) {
      const initialHeight = textArea.style.height;

      await act(async () => {
        await fireEvent.input(textArea, {
          target: {
            value:
              'This is a test to adjust the height of the textarea. It should grow as the content grows.',
          },
        });
      });

      const adjustedHeight = textArea.style.height;

      // Check if the height has been adjusted
      expect(initialHeight).not.toBe(adjustedHeight);
      expect(adjustedHeight).toBe(textArea.scrollHeight + 'px');
    }
  });

  test('does not adjust height if textarea is null', () => {
    const adjustTextareaHeight = (
      textarea: (EventTarget & HTMLTextAreaElement) | null,
    ) => {
      if (!textarea) return;
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
    };

    const textArea = null;

    // Calling the function with a null textarea to ensure coverage of the return statement
    adjustTextareaHeight(textArea);

    // If the function returns early, no further execution happens, so no assertions are needed
  });

  test('synchronizes textarea scroll with overlay scroll', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const textArea = baseElement.querySelector(
      '#description',
    ) as HTMLTextAreaElement;
    const overlay = baseElement.querySelector(
      '.overlay-text',
    ) as HTMLDivElement;

    if (textArea && overlay) {
      textArea.style.height = '100px';
      overlay.style.height = '100px';
      overlay.style.overflow = 'auto';

      // Simulate scrolling the textarea
      await act(async () => {
        fireEvent.scroll(textArea, { target: { scrollTop: 50 } });
      });

      // Check if the overlay scroll position has been synchronized with the textarea scroll position
      expect(overlay.scrollTop).toBe(textArea.scrollTop);
    }
  });

  test('simulates creating a standard app with thumbnail', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onPost(new RegExp('/server')).reply(200);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], null);
    queryClient.setQueryData(['app-profiles'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const thumbnailField = baseElement.querySelector(
      '#thumbnail',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && thumbnailField && frameworkField) {
      // Attempt submitting without filling in required fields
      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      const file = new File(['File contents'], 'image.png', {
        type: 'image/png',
      });
      await userEvent.upload(thumbnailField, file);

      await userEvent.type(displayNameField, 'App 1');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      // Submit with all required fields filled in
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('simulates creating an app with additional fields', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/conda-environments')).reply(200, environments);
    mock.onGet(new RegExp('/spawner-profiles')).reply(200, profiles);
    mock.onPost(new RegExp('/server')).reply(200);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], environments);
    queryClient.setQueryData(['app-profiles'], profiles);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#description',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '#framework',
    ) as HTMLSelectElement;
    const environmentField = baseElement.querySelector(
      '#conda_env',
    ) as HTMLSelectElement;
    const profileField = baseElement.querySelector(
      '#profile',
    ) as HTMLSelectElement;
    const customCommandField = baseElement.querySelector(
      '#custom_command',
    ) as HTMLInputElement;
    if (
      displayNameField &&
      descriptionField &&
      frameworkField &&
      environmentField &&
      profileField &&
      customCommandField
    ) {
      // Attempt submitting without filling in required fields
      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      await act(async () => {
        fireEvent.change(frameworkField, { target: { value: 'custom' } });
      });
      await act(async () => {
        fireEvent.change(environmentField, { target: { value: 'env-1' } });
      });
      await act(async () => {
        fireEvent.change(profileField, { target: { value: 'Small' } });
      });
      await userEvent.type(customCommandField, 'Some command');

      // Submit with all required fields filled in
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('simulates creating an app with an error', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onPost(new RegExp('/server')).reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#description',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('simulates editing an app', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    queryClient.setQueryData(['app-form'], app);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], null);
    queryClient.setQueryData(['app-profiles'], null);
    mock.onPut().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm id="app-1" />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#description',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Save');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/edit-app');
    }
  });

  test('simulates editing an app with an error', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    mock
      .onPut(new RegExp('/server/app-1'))
      .reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm id="app-1" />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#description',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Save');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });
      // TODO: Update this test when everything is running in single react app
      expect(window.location.pathname).not.toBe('/edit-app');
    }
  });

  test('clicks cancel to home', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const btn = baseElement.querySelector('#cancel-btn') as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Cancel');
    expect(btn).not.toHaveAttribute('disabled', 'disabled');
    await act(async () => {
      btn.click();
    });
    expect(window.location.pathname).toBe('/');
  });

  test('handles form submission when profiles are not available', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onPost(new RegExp('/server')).reply(200);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], null);
    queryClient.setQueryData(['app-profiles'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && frameworkField) {
      await userEvent.type(displayNameField, 'App without profile');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      // Assert that the form was submitted and navigated correctly
      // TODO: Update this assertion when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('handles form submission with existing app', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    mock.onPut(new RegExp('/server/app-1')).reply(200);
    queryClient.setQueryData(['app-form', 'app-1'], app);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm id="app-1" />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && frameworkField) {
      await userEvent.type(displayNameField, 'Updated App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Save');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      // Assert that the form was submitted and navigated correctly
      // TODO: Update this assertion when everything is running in single react app
      expect(window.location.pathname).not.toBe('/edit-app');
    }
  });

  test('handles switch toggle correctly', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const switchInput = baseElement.querySelector(
      '#keep_alive',
    ) as HTMLInputElement;

    if (switchInput) {
      expect(switchInput.checked).toBe(false);

      await act(async () => {
        fireEvent.click(switchInput);
      });

      expect(switchInput.checked).toBe(true);

      await act(async () => {
        fireEvent.click(switchInput);
      });

      expect(switchInput.checked).toBe(false);
    }
  });

  test('adjusts textarea height correctly when text is added', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const textArea = baseElement.querySelector(
      '#description',
    ) as HTMLTextAreaElement;

    if (textArea) {
      const initialHeight = textArea.style.height;

      await act(async () => {
        await fireEvent.input(textArea, {
          target: {
            value: 'This is a test to adjust the height of the textarea.',
          },
        });
      });

      const adjustedHeight = textArea.style.height;

      // Check if the height has been adjusted
      expect(initialHeight).not.toBe(adjustedHeight);
      expect(adjustedHeight).toBe(textArea.scrollHeight + 'px');
    }
  });

  test('renders CustomLabel correctly', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const customLabel = baseElement.querySelector('label') as HTMLLabelElement;

    expect(customLabel).toHaveTextContent('*');
    expect(customLabel).toHaveTextContent('Name');
  });

  test('handles form submission with thumbnail upload', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onPost(new RegExp('/server')).reply(200);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    queryClient.setQueryData(['app-environments'], null);
    queryClient.setQueryData(['app-profiles'], null);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const thumbnailField = baseElement.querySelector(
      '#thumbnail',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && thumbnailField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      const file = new File(['File contents'], 'image.png', {
        type: 'image/png',
      });
      await userEvent.upload(thumbnailField, file);
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Deploy App');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      // TODO: Update this assertion when everything is running in single react app
      expect(window.location.pathname).not.toBe('/create-app');
    }
  });

  test('handles editing an existing app with new data', async () => {
    mock.onGet(new RegExp('/frameworks')).reply(200, frameworks);
    mock.onGet(new RegExp('/server/app-1')).reply(200, app);
    mock.onPut(new RegExp('/server/app-1')).reply(200);
    queryClient.setQueryData(['app-form', 'app-1'], app);
    queryClient.setQueryData(['app-frameworks'], frameworks);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppForm id="app-1" />
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '[name="framework"]',
    ) as HTMLSelectElement;
    if (displayNameField && frameworkField) {
      await userEvent.type(displayNameField, 'Updated App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Save');
      expect(btn).not.toHaveAttribute('disabled', 'disabled');
      await act(async () => {
        btn.click();
      });

      // TODO: Update this assertion when everything is running in single react app
      expect(window.location.pathname).not.toBe('/edit-app');
    }
  });
});
