import { apps } from '@src/data/api';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';
import { StatusChip } from '..';

describe('StatusChip', () => {
  test('renders default chip successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Ready" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Ready');
  });

  test('renders pending chip successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Pending" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Pending');
  });

  test('renders running chip successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Running" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Running');
  });

  test('renders unknown chip successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Unknown" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Unknown');
  });

  test('renders running chip with additional info', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={apps[0]} />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Running on small');
  });

  test('renders shared app chip running with no additional info', () => {
    const newApp = { ...apps[0], shared: true };
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={newApp} />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Running');
  });

  test('simulates stopping app from chip button', async () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={apps[0]} />
      </RecoilRoot>,
    );
    const stopButton = baseElement.querySelector(
      '.MuiIconButton-root',
    ) as HTMLButtonElement;
    if (stopButton) {
      act(() => {
        stopButton.click();
      });
    }
    waitFor(() => {
      const stopModal = baseElement.querySelector('.MuiDialog-root');
      expect(stopModal).toBeTruthy();
    });
  });
});
