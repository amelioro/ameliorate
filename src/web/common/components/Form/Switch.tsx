import { FormControlLabel, Switch as MuiSwitch } from "@mui/material";
import startCase from "lodash/startCase";
import { ReactNode } from "react";
import { useController } from "react-hook-form";

interface Props {
  name: string; // not sure how to ensure this is actually a field on the form schema
  label?: ReactNode;
}

export const Switch = ({ name, label }: Props) => {
  // assumes this component is used within a FormProvider
  const { field } = useController({ name });

  return (
    <FormControlLabel
      label={label ?? startCase(name)}
      control={
        <MuiSwitch
          {...field}
          checked={field.value as boolean} // should be able to type-safe this but seems hard and not worth effort
          onChange={(_event, checked) => field.onChange(checked)}
        />
      }
    />
  );
};
