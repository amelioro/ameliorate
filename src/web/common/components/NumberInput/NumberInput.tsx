import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import * as React from "react";

export interface NumberInputProps {
  value?: number | null;
  onChange?: (event: React.SyntheticEvent, value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * A number input component with increment/decrement buttons using Base UI NumberField.
 *
 * This is an implementation made by directly following the example at https://mui.com/material-ui/react-number-field/
 * and slightly adapted via LLM.
 *
 * Not thoroughly reviewed because it's only used once right now, it's off to the side, and it seems
 * to work fine. Should review more closely / rewrite if it becomes a more significant component.
 */
export const NumberInput = React.forwardRef(function NumberInput(
  props: NumberInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { value, onChange, min, max, step = 1, disabled, readOnly } = props;

  const handleValueChange: BaseNumberField.Root.Props["onValueChange"] = (
    newValue,
    eventDetails,
  ) => {
    if (onChange) {
      // Create a minimal synthetic event for compatibility with the existing onChange signature.
      // The consumer (Form/NumberInput.tsx) calls preventDefault() on this and uses the value directly.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};
      const syntheticEvent = {
        preventDefault: noop,
        stopPropagation: noop,
        nativeEvent: eventDetails,
        target: { value: newValue },
      } as unknown as React.SyntheticEvent;
      onChange(syntheticEvent, newValue);
    }
  };

  return (
    <BaseNumberField.Root
      ref={ref}
      value={value ?? null}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
    >
      <BaseNumberField.Input
        render={(inputProps, state) => (
          <OutlinedInput
            inputRef={inputProps.ref}
            value={state.inputValue}
            onBlur={inputProps.onBlur}
            onChange={inputProps.onChange}
            onKeyDown={inputProps.onKeyDown}
            onKeyUp={inputProps.onKeyUp}
            onFocus={inputProps.onFocus}
            size="small"
            slotProps={{
              input: {
                style: { width: "50px", textAlign: "center" },
              },
            }}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{
                  flexDirection: "column",
                  maxHeight: "unset",
                  alignSelf: "stretch",
                  borderLeft: "1px solid",
                  borderColor: "divider",
                  ml: 0,
                  "& button": {
                    py: 0,
                    flex: 1,
                    borderRadius: 0.5,
                  },
                }}
              >
                <BaseNumberField.Increment
                  render={<IconButton size="small" aria-label="Increase" />}
                >
                  <KeyboardArrowUpIcon fontSize="small" sx={{ transform: "translateY(2px)" }} />
                </BaseNumberField.Increment>

                <BaseNumberField.Decrement
                  render={<IconButton size="small" aria-label="Decrease" />}
                >
                  <KeyboardArrowDownIcon fontSize="small" sx={{ transform: "translateY(-2px)" }} />
                </BaseNumberField.Decrement>
              </InputAdornment>
            }
            sx={{ pr: 0 }}
          />
        )}
      />
    </BaseNumberField.Root>
  );
});
