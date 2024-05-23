import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { StatusChip } from '..';

describe('StatusChip', () => {
  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Ready" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Ready');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Pending" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Pending');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Running" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Running');
  });

  test('renders default successfully', () => {
    const { baseElement } = render(
      <RecoilRoot>
        <StatusChip status="Unknown" />
      </RecoilRoot>,
    );
    const chip = baseElement.querySelector('.MuiChip-root');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('Unknown');
  });
});
