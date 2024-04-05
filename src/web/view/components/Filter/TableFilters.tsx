import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { getNodes } from "../../../topic/store/nodeGetters";
import { useCriteria, useProblems, useSolutions } from "../../../topic/store/nodeHooks";
import { setTableFilter, useTableFilter } from "../../navigateStore";
import { TableFilter, tableFilterSchema } from "../../utils/tableFilter";

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

export const TableFilters = () => {
  const tableFilter = useTableFilter();

  // exclusively used for defaulting, and not ideal because child Select components use these through hooks again anyway
  // not sure how to allow the child components to be responsible for default values for the form
  const problems = getNodes("problem"); // could consider selecting causes here, but probably don't want causes as options for tradeoffs filter

  const methods = useForm<TableFilter>({
    resolver: zodResolver(tableFilterSchema),
    defaultValues: {
      centralProblemId: getProp<string | undefined>(
        tableFilter,
        "centralProblemId",
        problems[0]?.id
      ),
      solutions: getProp<string[]>(tableFilter, "solutions", []),
      // TODO?: ideally this defaults to all criteria so that empty can mean no criteria displayed,
      // but we can't rely on `watch("centralProblemId")` with `useCriteria(centralProblemId)` since
      // watch isn't usable until after form definition. Potentially could move all defaults to
      // be specified on their component, but that's annoying and we'd also have to handle the first
      // render, during which `watch` is undefined.
      criteria: getProp<string[]>(tableFilter, "criteria", []),
    },
  });
  const { handleSubmit, watch } = methods;

  const centralProblemId = watch("centralProblemId");
  const useProblemSolutions = () => useSolutions(centralProblemId);
  const useProblemCriteria = () => useCriteria(centralProblemId);

  useEffect(() => {
    // trigger submit every time the form changes
    const subscription = watch(
      () =>
        void handleSubmit((data) => {
          setTableFilter(data);
        })()
    );

    return subscription.unsubscribe;
  }, [handleSubmit, watch]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <form style={{ padding: "8px" }}>
        <Stack spacing={1.5}>
          <NodeSelect
            name="centralProblemId"
            label="Central Problem"
            useNodeOptions={useProblems}
          />

          <NodeSelect name="solutions" useNodeOptions={useProblemSolutions} multiple />
          <NodeSelect name="criteria" useNodeOptions={useProblemCriteria} multiple />
        </Stack>
      </form>
    </FormProvider>
  );
};
