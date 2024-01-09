import { ChangeEvent, ChangeEventHandler, useEffect, useState } from 'react';

export interface ToggleProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The name of the text input
   */
  name?: string;
  /**
   * Whether the toggle is checked or not
   */
  checked?: boolean;
  /**
   * A label to display with the toggle
   */
  label?: string;
  /**
   * Custom callback for when input is changed
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const Toggle = ({
  id,
  name,
  checked = false,
  label,
  onChange,
}: ToggleProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const toggleHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked);
    if (onChange) {
      onChange(event);
    }
  };

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <div className="toggle flex items-center">
      <label
        htmlFor={id}
        className="flex items-center cursor-pointer"
        tabIndex={0}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            name={name}
            className="sr-only"
            checked={isChecked}
            onChange={toggleHandler}
          />
          <div
            className={`toggle-body w-12 h-6 rounded-full shadow-inner ${
              isChecked ? 'toggle-body-on' : ''
            }`}
          ></div>
          <div
            className={`toggle-dot absolute w-6 h-6 rounded-full shadow inset-y-0 left-0 ${
              isChecked ? 'ml-6' : 'ml-0'
            }`}
          ></div>
        </div>
        {label && <span className="toggle-label ml-3">{label}</span>}
      </label>
    </div>
  );
};

export default Toggle;
