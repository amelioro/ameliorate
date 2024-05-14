import { Autocomplete, TextField } from "@mui/material";
import { startCase } from "lodash";
import { useContext, useMemo } from "react";
import { useController } from "react-hook-form";

import { FormContext } from "./FormContext";

interface Props {
  name: string;
  label?: string;
  options: readonly { id: string; label: string }[] | readonly string[];
  multiple?: boolean;
  disableClearable?: boolean;
  width?: string;
}

export const Select = ({
  name,
  label,
  options,
  multiple = false,
  disableClearable,
  width,
}: Props) => {
  // assumes this component is used within a FormProvider
  const {
    field,
    fieldState: { error },
  } = useController({ name });
  const { submit } = useContext(FormContext);

  // if options is array of strings, use the strings as both value and label
  const optionsObjects = useMemo(
    () =>
      options.map((option) => {
        return typeof option === "object" ? option : { id: option, label: option };
      }),
    [options]
  );

  // Use object for the value so that a label can differ from the value (particularly if the value is an id),
  // but notably the form data will still just use the value (id) because the label is only for display.
  // Using null as a fallback so that value is never undefined, resulting in an uncontrolled input that could change to controlled when a value is set.
  const valueObject = useMemo(() => {
    if (multiple) {
      const selectedIds = (field.value ?? null) as string[] | null;
      return optionsObjects.filter((option) => selectedIds?.includes(option.id));
    } else {
      const selectedId = (field.value ?? null) as string | null;
      const valueInOptions = optionsObjects.find((option) => option.id === selectedId) ?? null;

      const fallback = optionsObjects[0] ?? null;
      const fallbackId = fallback?.id ?? null;
      const invalidSelectedId = selectedId && !valueInOptions;
      // TODO(bug1): if selection is invalid and there's no fallback, field will be empty with an error;
      // but if the selection becomes valid (perhaps via undo action), the filter will correctly activate
      // and the field will still show empty with an error (instead of showing what's correctly being used in the filter).
      // This is because the null value is never actually set in the store, only in the form (because validation fails).
      // TODO(bug2): when viewing criteria table, deleting the problem will throw error because this
      // onChange can result in parent Filter component re-rendering during this Select render;
      // presumably the fix is to trigger onChange within `useEffect`.
      if (invalidSelectedId) field.onChange(fallbackId);

      return !invalidSelectedId ? valueInOptions : fallback;
    }
  }, [multiple, optionsObjects, field]);

  const fieldLabel = label ?? startCase(name);

  return multiple ? (
    // GitHub code search found this example implementing Mui Autocomplete with react-hook-form https://github.com/GeoWerkstatt/ews-boda/blob/79cb1484db53170aace5a4b01ed1f9c56269f7c4/src/ClientApp/src/components/SchichtForm.js#L126-L153
    <Autocomplete
      {...field}
      options={optionsObjects}
      value={valueObject as { id: string; label: string }[]}
      multiple
      limitTags={1}
      disableCloseOnSelect
      onChange={(_event, options) => {
        field.onChange(options.map((option) => option.id));
        submit();
      }}
      disableClearable={disableClearable ?? false} // seems preferable to default to allow clear for multi-selects, since there could be a lot of entries selected
      renderInput={(params) => (
        <TextField {...params} label={fieldLabel} error={!!error} helperText={error?.message} />
      )}
      // required to avoid duplicate key error if two nodes have the same text
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
      size="small"
      sx={{ width: width }}
    />
  ) : (
    <Autocomplete
      {...field}
      options={optionsObjects}
      value={valueObject as { id: string; label: string } | null}
      onChange={(_event, option) => {
        if (!option) return;
        field.onChange(option.id);
        submit();
      }}
      disableClearable={disableClearable ?? true}
      renderInput={(params) => (
        <TextField {...params} label={fieldLabel} error={!!error} helperText={error?.message} />
      )}
      // required to avoid duplicate key error if two nodes have the same text
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
      size="small"
      sx={{ width: width }}
    />
  );
};
