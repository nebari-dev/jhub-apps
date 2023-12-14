import axios from '@src/utils/axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { RecoilRoot } from 'recoil';
import AppForm from './app-form';

describe('AppForm', () => {
  const queryClient = new QueryClient();
  const mock = new MockAdapter(axios);
  beforeAll(() => {
    mock.reset();
  });

  test('renders successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppForm />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    expect(baseElement.querySelector('div')).toBeTruthy();
  });

  test('simulates creating an app', async () => {
    mock.onPost().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppForm />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '#framework',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      await act(async () => {
        btn.click();
      });
    }
  });

  test('simulates creating an app with an error', async () => {
    mock.onPost().reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppForm />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '#framework',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      await act(async () => {
        btn.click();
      });
    }
  });

  test('simulates editing an app', async () => {
    mock.onPut().reply(200);
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppForm id="app-1" />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '#framework',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      await act(async () => {
        btn.click();
      });
    }
  });

  test('simulates editing an app with an error', async () => {
    mock.onPut().reply(500, { message: 'Some error' });
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppForm id="app-1" />
        </QueryClientProvider>
      </RecoilRoot>,
    );

    const displayNameField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const descriptionField = baseElement.querySelector(
      '#display_name',
    ) as HTMLInputElement;
    const frameworkField = baseElement.querySelector(
      '#framework',
    ) as HTMLSelectElement;
    if (displayNameField && descriptionField && frameworkField) {
      await userEvent.type(displayNameField, 'App 1');
      await userEvent.type(descriptionField, 'Some App');
      fireEvent.change(frameworkField, { target: { value: 'panel' } });

      const btn = baseElement.querySelector('#submit-btn') as HTMLButtonElement;
      await act(async () => {
        btn.click();
      });
    }
  });
});
