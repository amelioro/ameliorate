import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { nodeTypes } from "@/common/node";
import { deepIsEqual } from "@/common/utils";
import { FormContext } from "@/web/common/components/Form/FormContext";
import { NodeSelect } from "@/web/common/components/Form/NodeSelect";
import { Select } from "@/web/common/components/Form/Select";
import { Switch } from "@/web/common/components/Form/Switch";
import { useAllNodes } from "@/web/topic/store/nodeHooks";
import { possibleScores } from "@/web/topic/utils/graph";
import { ShowSecondaryNeighborsLabel } from "@/web/view/components/Filter/ShowSecondaryNeighborsLabel";
import { setGeneralFilter, useGeneralFilter } from "@/web/view/currentViewStore/filter";
import { useFormat } from "@/web/view/currentViewStore/store";
import {
  GeneralFilter,
  generalFilterSchema,
  scoredComparers,
} from "@/web/view/utils/generalFilter";

export const GeneralFilters = () => {
  const generalFilter = useGeneralFilter();
  const format = useFormat();

  const methods = useForm<GeneralFilter>({
    resolver: zodResolver(generalFilterSchema),
    defaultValues: generalFilter,
  });
  const { getValues, handleSubmit, reset } = methods;

  const submit = useCallback(() => {
    void handleSubmit((data) => setGeneralFilter(data))();
  }, [handleSubmit]);

  // update form when filter changes externally e.g. via undo/redo
  useEffect(() => {
    if (deepIsEqual(generalFilter, getValues())) return;
    reset(generalFilter);
  }, [generalFilter, getValues, reset]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <FormContext.Provider value={{ submit }}>
        <form style={{ padding: "8px" }}>
          {format === "diagram" && (
            <Stack spacing={1}>
              <Select name="nodeTypes" options={nodeTypes} multiple />

              <Stack direction="row" spacing={1}>
                <Switch name="showOnlyScored" label="Show only nodes scored" />
                <Select name="scoredComparer" options={scoredComparers} label="" width="50px" />
                <Select name="scoreToCompare" options={possibleScores} label="" width="50px" />
              </Stack>

              <NodeSelect name="nodesToShow" useNodeOptions={useAllNodes} multiple />
              <NodeSelect name="nodesToHide" useNodeOptions={useAllNodes} multiple />

              <Switch
                name="showSecondaryResearch"
                label={<ShowSecondaryNeighborsLabel secondaryInfoCategory="research" />}
              />
              <Switch
                name="showSecondaryBreakdown"
                label={<ShowSecondaryNeighborsLabel secondaryInfoCategory="breakdown" />}
              />
            </Stack>
          )}
          {format === "table" && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Switch name="showOnlyScored" label="Show only nodes scored" />
                <Select name="scoredComparer" options={scoredComparers} label="" width="50px" />
                <Select name="scoreToCompare" options={possibleScores} label="" width="50px" />
              </Stack>
            </Stack>
          )}
        </form>
      </FormContext.Provider>
    </FormProvider>
  );
};
