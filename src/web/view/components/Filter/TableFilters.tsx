import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { useCriteria, useNodesOfType, useSolutions } from "../../../topic/store/nodeHooks";
import { getTableFilterWithFallbacks, setTableFilter } from "../../navigateStore";
import { TableFilter, tableFilterSchema } from "../../utils/tableFilter";

export const TableFilters = () => {
  const tableFilter = getTableFilterWithFallbacks();

  const methods = useForm<TableFilter>({
    resolver: zodResolver(tableFilterSchema),
    defaultValues: tableFilter,
  });
  const { handleSubmit, watch } = methods;

  const useProblems = () => useNodesOfType("problem");

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
