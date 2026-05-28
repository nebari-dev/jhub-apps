import { apps } from '@src/data/api';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';
import { StatusChip } from '..';

describe('StatusChip', () => {
  test('renders default chip successfully', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Ready" />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toBe('Ready');
  });

  test('renders pending chip successfully', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Pending" />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toBe('Pending');
  });

  test('renders running chip successfully', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Running" />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toBe('Running');
  });

  test('renders unknown chip successfully', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Unknown" />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toBe('Unknown');
  });

  test('renders running chip with additional info', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={apps[0]} />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toContain('Running on small');
  });

  test('renders shared app chip running with no additional info', () => {
    const newApp = { ...apps[0], shared: true };
    render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={newApp} />
      </RecoilRoot>,
    );
    const chip = screen.getByTestId('status-chip');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toBe('Running');
  });

  test('simulates stopping app from chip button', () => {
    render(
      <RecoilRoot>
        <StatusChip status="Running" additionalInfo="small" app={apps[0]} />
      </RecoilRoot>,
    );
    const stopButton = screen.getByTestId('status-chip-stop');
    act(() => {
      fireEvent.click(stopButton);
    });
    expect(stopButton).toBeInTheDocument();
  });
});
