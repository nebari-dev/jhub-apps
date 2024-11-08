import { render, screen } from '@testing-library/react';
import { CustomLabel } from './custom-label';

describe('CustomLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when rendering the CustomLabel', () => {
    test('renders the label text', () => {
      render(<CustomLabel label="Username" required={false} />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    test('does not show asterisk when not required', () => {
      render(<CustomLabel label="Email" required={false} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    test('shows asterisk when required', () => {
      render(<CustomLabel label="Password" required={true} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('renders asterisk with provided required color when required', () => {
      const customProps = {
        requiredColor: 'red',
      };

      render(
        <CustomLabel
          label="Required Field"
          required={true}
          style={customProps}
        />,
      );
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveStyle({ color: 'red' });
    });
  });
});
