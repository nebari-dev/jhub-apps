import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ServicesGrid } from './services-grid';

describe('ServicesGrid', () => {
  const queryClient = new QueryClient();

  // const mock = new MockAdapter(axios);

  // beforeEach(() => {
  //   mock.reset();
  // });

  test('renders a default grid successfully', () => {
    // mock.onGet(new RegExp('/hub/assets/*')).reply(200, {});
    const { baseElement } = render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ServicesGrid />
        </QueryClientProvider>
      </RecoilRoot>,
    );
    const header = baseElement.querySelector('h4');

    expect(baseElement).toBeTruthy();
    expect(header).toHaveTextContent('Services');
  });

  // test('renders with mocked data', () => {
  //   mock.onGet(new RegExp('/hub/assets/*')).reply(200, services);
  //   const { baseElement } = render(
  //     <RecoilRoot>
  //       <QueryClientProvider client={queryClient}>
  //         <ServicesGrid />
  //       </QueryClientProvider>
  //     </RecoilRoot>,
  //   );
  //   const svcs = baseElement.querySelectorAll('button');
  //   expect(svcs).toHaveLength(5);
  // });
});
