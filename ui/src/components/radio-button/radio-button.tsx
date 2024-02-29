import React, { ChangeEventHandler, MouseEventHandler } from 'react';

export interface RadioButtonProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The name for the radioButton input field string
   */
  name: string;
  /**
   * Whether the component is rendered as a tile boolean
   */
  isTile?: boolean;
  /**
   * Event handler will be triggered when the radioButton value changes
   * changeEventHandler<HTMLInputElement>
   */
  onChange: ChangeEventHandler<HTMLInputElement>;
  /**
   * Event handler will be triggered when the radioButton is clicked
   * MouseEventHandler<HTMLInputElement>
   */
  onClick?: MouseEventHandler<HTMLInputElement>;
  /**
   * The text inside of the radioButton string
   */
  label: string;
  /**
   * The text below the label
   */
  subtext?: string;
  /**
   * Default value of the radioButton string | number | readonly string[]
   */
  value: string | number | readonly string[];
  /**
   * Whether the radioButton is checked by default boolean
   */
  checked: boolean;
}
const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  onChange,
  onClick,
  label,
  subtext,
  value,
  checked,
}) => {
  return (
    <div className="radio-button">
      <label htmlFor={id}>
        <input
          className="radio"
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          onClick={onClick}
        />
        {label}
        <div className="subtext">{subtext}</div>
      </label>
    </div>
  );
};

export default RadioButton;
