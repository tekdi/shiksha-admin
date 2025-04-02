import React from "react";
import { WidgetProps } from "@rjsf/utils";

const CustomDateWidget: React.FC<WidgetProps> = ({
  id,
  value,
  required,
  disabled,
  readonly,
  label,
  onChange,
}) => {
  // Calculate yesterday's date to disable today
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  return (
    <input
      type="date"
      id={id}
      value={value || ""}
      required={required}
      disabled={disabled || readonly}
      max={maxDate} // Set max date to yesterday
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default CustomDateWidget;
