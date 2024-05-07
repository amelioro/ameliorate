import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { nodeTypes } from "../../../../common/node";
import { FormContext } from "../../../common/components/Form/FormContext";
import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { Select } from "../../../common/components/Form/Select";
import { Switch } from "../../../common/components/Form/Switch";
import { deepIsEqual } from "../../../common/store/utils";
import { useAllNodes } from "../../../topic/store/nodeHooks";
import { possibleScores } from "../../../topic/utils/graph";
import { setGeneralFilter, useGeneralFilter } from "../../currentViewStore/filter";
import { useFormat } from "../../currentViewStore/store";
import { GeneralFilter, generalFilterSchema, scoredComparers } from "../../utils/generalFilter";
import { ShowSecondaryNeighborsLabel } from "./ShowSecondaryNeighborsLabel";

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

              <NodeSelect
                name="nodesToShow"
                useNodeOptions={useAllNodes}
                multiple
                disableClearable={false}
              />
              <NodeSelect
                name="nodesToHide"
                useNodeOptions={useAllNodes}
                multiple
                disableClearable={false}
              />

              <Switch
                name="showSecondaryResearch"
                label={<ShowSecondaryNeighborsLabel secondaryInfoCategory="research" />}
              />
              <Switch
                name="showSecondaryStructure"
                label={<ShowSecondaryNeighborsLabel secondaryInfoCategory="structure" />}
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
