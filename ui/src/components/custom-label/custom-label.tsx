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
  const { requiredColor, ...restStyle } = style ?? {};
  return (
    <span className="bg-background px-0.5" style={restStyle}>
      {required && <span style={{ color: requiredColor || 'inherit' }}>*</span>}
      {label}
    </span>
  );
};

export default CustomLabel;
