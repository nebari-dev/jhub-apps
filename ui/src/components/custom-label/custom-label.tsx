export interface CustomLabelProps {
  label: string;
  required?: boolean;
  style?: React.CSSProperties & { requiredColor?: string };
}

export const CustomLabel = ({
  label,
  required,
  style,
}: CustomLabelProps): React.ReactElement => {
  return (
    <span style={{ backgroundColor: '#fafafa', padding: '0 2px', ...style }}>
      {required && (
        <span style={{ color: style?.requiredColor || 'inherit' }}>*</span>
      )}
      {label}
    </span>
  );
};

export default CustomLabel;
