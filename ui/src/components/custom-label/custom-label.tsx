import classnames from 'classnames';

export interface CustomLabelProps {
  label: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties & { requiredColor?: string };
}

export const CustomLabel = ({
  label,
  required,
  className,
  style,
}: CustomLabelProps): React.ReactElement => {
  const classes = classnames('custom-label', className);

  return (
    <span
      className={classes}
      style={{ backgroundColor: '#fafafa', padding: '0 2px', ...style }}
    >
      {required && (
        <span style={{ color: style?.requiredColor || 'inherit' }}>*</span>
      )}{' '}
      {label}
    </span>
  );
};

export default CustomLabel;
