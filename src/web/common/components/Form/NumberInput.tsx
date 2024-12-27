import { Typography } from "@mui/material";
import startCase from "lodash/startCase";
import { useContext } from "react";
import { useController } from "react-hook-form";

import { FormContext } from "@/web/common/components/Form/FormContext";
import { NumberInput as MuiNumberInput } from "@/web/common/components/NumberInput/NumberInput";

interface Props {
  name: string; // not sure how to ensure this is actually a field on the form schema
  min?: number;
  max?: number;
}

export const NumberInput = ({ name, min, max }: Props) => {
  // assumes this component is used within a FormProvider
  const { field } = useController({ name });
  const { submit } = useContext(FormContext);

  return (
    <div className="flex items-center gap-2">
      <Typography variant="body2">{startCase(name)}</Typography>
      <MuiNumberInput
        {...field}
        min={min}
        max={max}
        value={field.value as number} // should be able to type-safe this but seems hard and not worth effort
        onChange={(event, value) => {
          event.preventDefault(); // don't trigger default form submit, which would refresh the page
          if (value === null) throw new Error("NumberInput should not allow empty value");

          field.onChange(value);
          submit();
        }}
      />
    </div>
  );
};
