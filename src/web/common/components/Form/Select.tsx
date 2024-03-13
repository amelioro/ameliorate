import { Autocomplete, TextField } from "@mui/material";
import { startCase } from "lodash";
import { useMemo } from "react";
import { useController } from "react-hook-form";

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
  disableClearable = true,
  width,
}: Props) => {
  // assumes this component is used within a FormProvider
  const {
    field,
    fieldState: { error },
  } = useController({ name });

  // if options is array of strings, use the strings as both value and label
  const optionsObjects = options.map((option) => {
    return typeof option === "object" ? option : { id: option, label: option };
  });

  // array if multiple, string if single
  const selectedIds = field.value as string[] | string;

  // Use object for the value so that a label can differ from the value (particularly if the value is an id),
  // but notably the form data will still just use the value (id) because the label is only for display.
  const valueObject = useMemo(() => {
    if (multiple) {
      return optionsObjects.filter((option) => (selectedIds as string[]).includes(option.id));
    } else {
      const value = optionsObjects.find((option) => option.id === selectedIds);
      // if the selected value has been deleted, remove it from the list
      if (selectedIds && !value) field.onChange(optionsObjects[0]?.id);
      return value ?? optionsObjects[0];
    }
  }, [multiple, optionsObjects, selectedIds, field]);

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
      }}
      disableClearable={disableClearable}
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
      value={valueObject as { id: string; label: string }}
      onChange={(_event, option) => {
        if (!option) return;
        field.onChange(option.id);
      }}
      disableClearable={disableClearable}
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
