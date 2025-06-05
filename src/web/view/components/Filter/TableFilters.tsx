import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { deepIsEqual } from "@/common/utils";
import { FormContext } from "@/web/common/components/Form/FormContext";
import { NodeSelect } from "@/web/common/components/Form/NodeSelect";
import { useCriteria, useNodesOfType, useSolutions } from "@/web/topic/diagramStore/nodeHooks";
import { setTableFilter, useTableFilterWithFallbacks } from "@/web/view/currentViewStore/filter";
import { TableFilter, tableFilterSchema } from "@/web/view/utils/tableFilter";

export const TableFilters = () => {
  const tableFilter = useTableFilterWithFallbacks();

  const methods = useForm<TableFilter>({
    resolver: zodResolver(tableFilterSchema),
    defaultValues: tableFilter,
  });
  const { getValues, handleSubmit, reset, watch } = methods;

  const useProblems = () => useNodesOfType("problem");

  const centralProblemId = watch("centralProblemId");
  const useProblemSolutions = () => useSolutions(centralProblemId);
  const useProblemCriteria = () => useCriteria(centralProblemId);

  const submit = useCallback(() => {
    void handleSubmit((data) => setTableFilter(data))();
  }, [handleSubmit]);

  // update form when filter changes externally e.g. via undo/redo
  useEffect(() => {
    if (deepIsEqual(tableFilter, getValues())) return;
    reset(tableFilter);
  }, [getValues, reset, tableFilter]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <FormContext.Provider value={{ submit }}>
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
      </FormContext.Provider>
    </FormProvider>
  );
};
