import classnames from 'classnames';
import { ChangeEventHandler } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * An array of select options to display
   */
  options: SelectOption[];
  /**
   * Custom callback for when input is changed
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const Select = ({
  id,
  options,
  className,
  onChange,
  ...props
}: SelectProps & JSX.IntrinsicElements['select']) => {
  const classes = classnames('select p-2', className);
  return (
    <select id={id} className={classes} onChange={onChange} {...props}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
