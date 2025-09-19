// Utility functions for handling input field changes properly

export const createNumberInputHandler = (
  onChange: (value: number | undefined) => void,
  allowDecimals: boolean = true
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string or valid number
    const regex = allowDecimals ? /^\d*\.?\d*$/ : /^\d*$/;
    
    if (value === "" || regex.test(value)) {
      onChange(
        value === ""
          ? undefined
          : allowDecimals
          ? parseFloat(value)
          : parseInt(value, 10)
      );
    }
  };
};

export const createIntegerInputHandler = (
  onChange: (value: number | undefined) => void
) => {
  return createNumberInputHandler(onChange, false);
};

export const createDecimalInputHandler = (
  onChange: (value: number | undefined) => void
) => {
  return createNumberInputHandler(onChange, true);
};

// Enhanced input props for number fields
export const getNumberInputProps = (
  value: number | undefined,
  onChange: (value: number | undefined) => void,
  allowDecimals: boolean = true
) => {
  return {
    type: "number" as const,
    value: value ?? "",
    onChange: createNumberInputHandler(onChange, allowDecimals),
    step: allowDecimals ? "0.01" : "1",
  };
};

// Enhanced input props for integer fields
export const getIntegerInputProps = (
  value: number | undefined,
  onChange: (value: number | undefined) => void
) => {
  return getNumberInputProps(value, onChange, false);
};

// Enhanced input props for decimal fields
export const getDecimalInputProps = (
  value: number | undefined,
  onChange: (value: number | undefined) => void
) => {
  return getNumberInputProps(value, onChange, true);
};
