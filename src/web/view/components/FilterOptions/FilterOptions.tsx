import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete, FormControlLabel, Stack, Switch, TextField, Tooltip } from "@mui/material";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { NodeType, exploreNodeTypes, topicNodeTypes } from "../../../../common/node";
import {
  useCriteria,
  useProblems,
  useQuestions,
  useSolutions,
  useSources,
} from "../../../topic/store/nodeHooks";
import { setFilterOptions, useFilterOptions } from "../../navigateStore";
import {
  FilterTypes,
  exploreFilterTypes,
  filterOptionsSchema,
  filterSchemas,
  topicFilterTypes,
} from "../../utils/filter";

type ValidatedFormData = z.infer<typeof filterOptionsSchema>;

// how to build this based on schemas? .merge doesn't work because `type` is overridden by the last schema's literal
interface FormData {
  nodeTypes: NodeType[];
  showSecondaryNeighbors: boolean;
  type: FilterTypes;
  centralProblemId?: string;
  showCauses: boolean;
  showEffects: boolean;
  showCriteria: boolean;
  showSolutions: boolean;
  centralSolutionId?: string;
  detail: "all" | "connectedToCriteria" | "none";
  solutions: string[];
  criteria: string[];
  centralQuestionId?: string;
  centralSourceId?: string;
}

/**
 * Helper to grab properties from an object whose type isn't narrow enough to know that the property exists.
 *
 * @returns the value of the property if the object exists with it, otherwise the default value
 */
const getProp = <T,>(obj: object | null, prop: string, defaultValue: T): T => {
  if (!obj || !(prop in obj)) return defaultValue;
  const value = (obj as Record<string, T>)[prop];
  return value ?? defaultValue;
};

interface Props {
  activeView: "topicDiagram" | "exploreDiagram";
}

/**
 * Features:
 * - Tracks filter options per diagram, so that you can quickly switch between diagrams without losing filter
 * - Reuses field values across filters (e.g. central problem retains value when switching filter type)
 * - Defaults field values based on nodes that exist in the diagram
 * - Shows field components and validates based on filter type
 */
export const FilterOptions = ({ activeView }: Props) => {
  const filterOptions = useFilterOptions(activeView);
  const problems = useProblems(); // could consider selecting causes here, but probably don't want causes as options for tradeoffs filter
  const allSolutions = useSolutions();
  const questions = useQuestions();
  const sources = useSources();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(filterOptionsSchema),
    defaultValues: {
      nodeTypes: filterOptions.nodeTypes,
      showSecondaryNeighbors: filterOptions.showSecondaryNeighbors,
      type: filterOptions.type,
      centralProblemId: getProp<string | undefined>(
        filterOptions,
        "centralProblemId",
        problems[0]?.id
      ),
      showCauses: getProp<boolean>(filterOptions, "showCauses", true),
      showEffects: getProp<boolean>(filterOptions, "showEffects", true),
      showCriteria: getProp<boolean>(filterOptions, "showCriteria", false),
      showSolutions: getProp<boolean>(filterOptions, "showSolutions", false),
      centralSolutionId: getProp<string | undefined>(
        filterOptions,
        "centralSolutionId",
        allSolutions[0]?.id
      ),
      detail: getProp<"all" | "connectedToCriteria" | "none">(filterOptions, "detail", "all"),
      solutions: getProp<string[]>(filterOptions, "solutions", []),
      // TODO?: ideally this defaults to all criteria so that empty can mean no criteria displayed,
      // but we can't rely on `watch("centralProblemId")` with `useCriteria(centralProblemId)` since
      // watch isn't usable until after form definition. Potentially could move all defaults to
      // be specified on their component, but that's annoying and we'd also have to handle the first
      // render, during which `watch` is undefined.
      criteria: getProp<string[]>(filterOptions, "criteria", []),
      centralQuestionId: getProp<string | undefined>(
        filterOptions,
        "centralQuestionId",
        questions[0]?.id
      ),
      centralSourceId: getProp<string | undefined>(
        filterOptions,
        "centralSourceId",
        sources[0]?.id
      ),
    },
  });

  const filterNodeTypes = activeView === "topicDiagram" ? topicNodeTypes : exploreNodeTypes;
  const filterTypes = activeView === "topicDiagram" ? topicFilterTypes : exploreFilterTypes;

  const type = watch("type");
  const typeSchemaShape = filterSchemas[type].shape;

  // TODO?: maybe worth extracting a component per field? but a lot is coupled... maybe best would be
  // to extract a NodeAutocomplete component, since these are all autocompletes
  const centralProblemId = watch("centralProblemId");
  const centralProblemOptions = useMemo(() => {
    return problems.map((problem) => ({ label: problem.data.label, id: problem.id }));
  }, [problems]);
  const centralProblemValue = useMemo(() => {
    const value = centralProblemOptions.find((option) => option.id === centralProblemId);
    if (centralProblemId && !value) setValue("centralProblemId", centralProblemOptions[0]?.id); // if node is deleted, make sure we don't retain the deleted id to make the form think it's valid
    return value ?? centralProblemOptions[0];
  }, [centralProblemId, centralProblemOptions, setValue]);

  const centralSolutionId = watch("centralSolutionId");
  const centralSolutionOptions = useMemo(() => {
    return allSolutions.map((solution) => ({ label: solution.data.label, id: solution.id }));
  }, [allSolutions]);
  const centralSolutionValue = useMemo(() => {
    const value = centralSolutionOptions.find((option) => option.id === centralSolutionId);
    if (centralSolutionId && !value) setValue("centralSolutionId", centralSolutionOptions[0]?.id); // if node is deleted, make sure we don't retain the deleted id to make the form think it's valid
    return value ?? centralSolutionOptions[0];
  }, [centralSolutionId, centralSolutionOptions, setValue]);

  const problemSolutions = useSolutions(centralProblemId);
  const selectedSolutions = watch("solutions");
  const solutionOptions = useMemo(() => {
    return problemSolutions.map((solution) => ({ label: solution.data.label, id: solution.id }));
  }, [problemSolutions]);
  const solutionValues = useMemo(() => {
    return solutionOptions.filter((option) => selectedSolutions.includes(option.id));
  }, [selectedSolutions, solutionOptions]);

  const criteria = useCriteria(centralProblemId);
  const selectedCriteria = watch("criteria");
  const criteriaOptions = useMemo(() => {
    return criteria.map((criterion) => ({ label: criterion.data.label, id: criterion.id }));
  }, [criteria]);
  const criteriaValues = useMemo(() => {
    return criteriaOptions.filter((option) => selectedCriteria.includes(option.id));
  }, [selectedCriteria, criteriaOptions]);

  const centralQuestionId = watch("centralQuestionId");
  const centralQuestionOptions = useMemo(() => {
    return questions.map((question) => ({ label: question.data.label, id: question.id }));
  }, [questions]);
  const centralQuestionValue = useMemo(() => {
    const value = centralQuestionOptions.find((option) => option.id === centralQuestionId);
    if (centralQuestionId && !value) setValue("centralQuestionId", centralQuestionOptions[0]?.id); // if node is deleted, make sure we don't retain the deleted id to make the form think it's valid
    return value ?? centralQuestionOptions[0];
  }, [centralQuestionId, centralQuestionOptions, setValue]);

  const centralSourceId = watch("centralSourceId");
  const centralSourceOptions = useMemo(() => {
    return sources.map((source) => ({ label: source.data.label, id: source.id }));
  }, [sources]);
  const centralSourceValue = useMemo(() => {
    const value = centralSourceOptions.find((option) => option.id === centralSourceId);
    if (centralSourceId && !value) setValue("centralSourceId", centralSourceOptions[0]?.id); // if node is deleted, make sure we don't retain the deleted id to make the form think it's valid
    return value ?? centralSourceOptions[0];
  }, [centralSourceId, centralSourceOptions, setValue]);

  const submit = useCallback(() => {
    void handleSubmit((data) => {
      // We know that zod has validated the data by this point.
      // `FormData` is used for the form's data type so that form `errors` type has all props;
      // without this, `errors` only knows the props that intersect all the schemas, i.e. `type`.
      setFilterOptions(data as ValidatedFormData);
    })();
  }, [handleSubmit]);

  // TODO?: is there a way to submit when any input changes, without using onChange for each individual component?
  return (
    <form style={{ padding: "8px" }}>
      <Stack spacing={1.5}>
        <Controller
          control={control}
          name="nodeTypes"
          render={({ field }) => (
            <Autocomplete
              {...field}
              multiple
              limitTags={2} // one line's worth
              disableCloseOnSelect
              options={filterNodeTypes}
              onChange={(_event, values) => {
                field.onChange([...values]);
                submit();
              }}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Node Types"
                  error={!!errors.nodeTypes}
                  helperText={errors.nodeTypes?.message}
                />
              )}
              size="small"
            />
          )}
        />
        <Controller
          control={control}
          name="showSecondaryNeighbors"
          render={({ field }) => (
            <FormControlLabel
              label={
                <Stack direction="row" alignItems="center">
                  Show
                  <Tooltip
                    title={
                      <span>
                        Secondary nodes are those that aren't the focus of the current diagram.
                        <br />
                        <br />
                        For example, question and fact nodes are secondary in the topic diagram, and
                        problem and solution nodes are secondary in the explore diagram.
                      </span>
                    }
                    enterTouchDelay={0} // allow touch to immediately trigger
                    leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
                  >
                    <span
                      style={{ textDecoration: "underline", marginLeft: "4px", marginRight: "4px" }}
                    >
                      Secondary
                    </span>
                  </Tooltip>
                  Neighbors
                </Stack>
              }
              control={
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={(_event, checked) => {
                    field.onChange(checked);
                    submit();
                  }}
                />
              }
            />
          )}
        />
        {/* GitHub code search found this example implementing Mui Autocomplete with react-hook-form https://github.com/GeoWerkstatt/ews-boda/blob/79cb1484db53170aace5a4b01ed1f9c56269f7c4/src/ClientApp/src/components/SchichtForm.js#L126-L153 */}
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={filterTypes}
              onChange={(_event, value) => {
                field.onChange(value);
                submit(); // how otherwise to ensure submit happens on change of any form input?
              }}
              disableClearable
              renderInput={(params) => <TextField {...params} label="Standard Filter" />}
              size="small"
            />
          )}
        />
        {"centralProblemId" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="centralProblemId"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={centralProblemOptions}
                value={centralProblemValue}
                onChange={(_event, value) => {
                  if (!value) return;
                  field.onChange(value.id);
                  submit();
                }}
                disableClearable={centralProblemValue !== undefined}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Central Problem"
                    error={!!errors.centralProblemId}
                    helperText={errors.centralProblemId?.message}
                  />
                )}
                // required to avoid duplicate key error if two nodes have the same text https://github.com/mui/material-ui/issues/26492#issuecomment-901089142
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  );
                }}
                size="small"
              />
            )}
          />
        )}
        {"showCauses" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="showCauses"
            render={({ field }) => (
              <FormControlLabel
                label="Show Causes"
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(_event, checked) => {
                      field.onChange(checked);
                      submit();
                    }}
                  />
                }
              />
            )}
          />
        )}
        {"showEffects" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="showEffects"
            render={({ field }) => (
              <FormControlLabel
                label="Show Effects"
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(_event, checked) => {
                      field.onChange(checked);
                      submit();
                    }}
                  />
                }
              />
            )}
          />
        )}
        {"showCriteria" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="showCriteria"
            render={({ field }) => (
              <FormControlLabel
                label="Show Criteria"
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(_event, checked) => {
                      field.onChange(checked);
                      submit();
                    }}
                  />
                }
              />
            )}
          />
        )}
        {"showSolutions" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="showSolutions"
            render={({ field }) => (
              <FormControlLabel
                label="Show Solutions"
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(_event, checked) => {
                      field.onChange(checked);
                      submit();
                    }}
                  />
                }
              />
            )}
          />
        )}
        {"centralSolutionId" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="centralSolutionId"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={centralSolutionOptions}
                value={centralSolutionValue}
                onChange={(_event, value) => {
                  if (!value) return;
                  field.onChange(value.id);
                  submit();
                }}
                disableClearable={centralSolutionValue !== undefined}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Central Solution"
                    error={!!errors.centralSolutionId}
                    helperText={errors.centralSolutionId?.message}
                  />
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
              />
            )}
          />
        )}
        {"detail" in typeSchemaShape && (
          <Controller
            control={control}
            name="detail"
            render={({ field }) => (
              <Autocomplete
                {...field}
                // TODO: build options with Pascal Case
                options={typeSchemaShape.detail.options.map((option) => option.value)}
                onChange={(_event, value) => {
                  field.onChange(value);
                  submit();
                }}
                disableClearable
                renderInput={(params) => <TextField {...params} label="Detail" />}
                size="small"
              />
            )}
          />
        )}
        {"solutions" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="solutions"
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                limitTags={1}
                disableCloseOnSelect
                options={solutionOptions}
                value={solutionValues}
                onChange={(_event, values) => {
                  field.onChange(values.map((value) => value.id));
                  submit();
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Solutions"
                    error={!!errors.solutions}
                    helperText={errors.solutions?.message}
                  />
                )}
                // required to avoid duplicate key error if two nodes have the same text https://github.com/mui/material-ui/issues/26492#issuecomment-901089142
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  );
                }}
                size="small"
              />
            )}
          />
        )}
        {"criteria" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="criteria"
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                limitTags={1}
                disableCloseOnSelect
                options={criteriaOptions}
                value={criteriaValues}
                onChange={(_event, values) => {
                  field.onChange(values.map((value) => value.id));
                  submit();
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Criteria"
                    error={!!errors.criteria}
                    helperText={errors.criteria?.message}
                  />
                )}
                // required to avoid duplicate key error if two nodes have the same text https://github.com/mui/material-ui/issues/26492#issuecomment-901089142
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  );
                }}
                size="small"
              />
            )}
          />
        )}
        {"centralQuestionId" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="centralQuestionId"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={centralQuestionOptions}
                value={centralQuestionValue}
                onChange={(_event, value) => {
                  if (!value) return;
                  field.onChange(value.id);
                  submit();
                }}
                disableClearable={centralQuestionValue !== undefined}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Central Question"
                    error={!!errors.centralQuestionId}
                    helperText={errors.centralQuestionId?.message}
                  />
                )}
                // required to avoid duplicate key error if two nodes have the same text https://github.com/mui/material-ui/issues/26492#issuecomment-901089142
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  );
                }}
                size="small"
              />
            )}
          />
        )}
        {"centralSourceId" in filterSchemas[type].shape && (
          <Controller
            control={control}
            name="centralSourceId"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={centralSourceOptions}
                value={centralSourceValue}
                onChange={(_event, value) => {
                  if (!value) return;
                  field.onChange(value.id);
                  submit();
                }}
                disableClearable={centralSourceValue !== undefined}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Central Source"
                    error={!!errors.centralSourceId}
                    helperText={errors.centralSourceId?.message}
                  />
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
              />
            )}
          />
        )}
      </Stack>
    </form>
  );
};
