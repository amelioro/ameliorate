import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { NodeType, researchNodeTypes, topicNodeTypes } from "../../../../common/node";
import { Switch } from "../../../common/components/Form/Switch";
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
  filterOptionsSchema,
  filterSchemas,
  researchFilterTypes,
  topicFilterTypes,
} from "../../utils/filter";
import { ShowSecondaryNeighborsLabel } from "./ShowSecondaryNeighborsLabel";

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
  activeView: "topicDiagram" | "researchDiagram";
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

  const methods = useForm<FormData>({
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
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const filterNodeTypes = activeView === "topicDiagram" ? topicNodeTypes : researchNodeTypes;
  const filterTypes = activeView === "topicDiagram" ? topicFilterTypes : researchFilterTypes;

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

  useEffect(() => {
    // trigger submit every time the form changes
    const subscription = watch(
      () =>
        void handleSubmit((data) => {
          // We know that zod has validated the data by this point.
          // `FormData` is used for the form's data type so that form `errors` type has all props;
          // without this, `errors` only knows the props that intersect all the schemas, i.e. `type`.
          setFilterOptions(data as ValidatedFormData);
        })()
    );

    return subscription.unsubscribe;
  }, [handleSubmit, watch]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
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
                onChange={(_event, values) => field.onChange([...values])}
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

          <Switch name="showSecondaryNeighbors" label={<ShowSecondaryNeighborsLabel />} />

          {/* GitHub code search found this example implementing Mui Autocomplete with react-hook-form https://github.com/GeoWerkstatt/ews-boda/blob/79cb1484db53170aace5a4b01ed1f9c56269f7c4/src/ClientApp/src/components/SchichtForm.js#L126-L153 */}
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={filterTypes}
                onChange={(_event, value) => field.onChange(value)}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Standard Filter"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  />
                )}
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
                    field.onChange(value.id);
                  }}
                  disableClearable={true}
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

          {"showCauses" in filterSchemas[type].shape && <Switch name="showCauses" />}
          {"showEffects" in filterSchemas[type].shape && <Switch name="showEffects" />}
          {"showCriteria" in filterSchemas[type].shape && <Switch name="showCriteria" />}
          {"showSolutions" in filterSchemas[type].shape && <Switch name="showSolutions" />}

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
                  onChange={(_event, value) => field.onChange(value)}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Detail"
                      error={!!errors.detail}
                      helperText={errors.detail?.message}
                    />
                  )}
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
                  onChange={(_event, values) => field.onChange(values.map((value) => value.id))}
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
                  onChange={(_event, values) => field.onChange(values.map((value) => value.id))}
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
    </FormProvider>
  );
};
