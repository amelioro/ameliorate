import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { nodeTypes } from "../../../../common/node";
import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { Select } from "../../../common/components/Form/Select";
import { Switch } from "../../../common/components/Form/Switch";
import { useAllNodes } from "../../../topic/store/nodeHooks";
import { possibleScores } from "../../../topic/utils/graph";
import { setGeneralFilter, useFormat, useGeneralFilter } from "../../navigateStore";
import { GeneralFilter, generalFilterSchema, scoredComparers } from "../../utils/generalFilter";
import { ShowSecondaryNeighborsLabel } from "./ShowSecondaryNeighborsLabel";

export const GeneralFilters = () => {
  const generalFilter = useGeneralFilter();
  const format = useFormat();

  const methods = useForm<GeneralFilter>({
    resolver: zodResolver(generalFilterSchema),
    defaultValues: generalFilter,
  });
  const { handleSubmit, watch } = methods;

  const useNodesToShow = () => useAllNodes(generalFilter.nodesToShow);
  const useNodesToHide = () => useAllNodes(generalFilter.nodesToHide);

  // TODO(bug): filter components don't update if filter changes outside of this component (e.g. right-click hide this node)
  // Can't just useEffect to reset form whenever generalFilter changes because that triggers this subscription, setting filter and infinite looping.
  // It's probably worth triggering handleSubmit on each filter component change, then we can reset the form every time the filter changes without looping.
  useEffect(() => {
    // trigger submit every time the form changes
    const subscription = watch(
      () =>
        void handleSubmit((data) => {
          setGeneralFilter(data);
        })()
    );

    return subscription.unsubscribe;
  }, [handleSubmit, watch]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <form style={{ padding: "8px" }}>
        {format === "diagram" && (
          <Stack spacing={1}>
            <Select name="nodeTypes" options={nodeTypes} multiple />

            <Stack direction="row" spacing={1}>
              <Switch name="showOnlyScored" label="Show only nodes scored" />
              <Select name="scoredComparer" options={scoredComparers} label="" width="50px" />
              <Select name="scoreToCompare" options={possibleScores} label="" width="50px" />
            </Stack>

            {/* potentially could just use all nodes as options here, but that'd re-render pretty often, and would be a ton of nodes to choose from */}
            <NodeSelect name="nodesToShow" useNodeOptions={useNodesToShow} multiple />
            <NodeSelect name="nodesToHide" useNodeOptions={useNodesToHide} multiple />

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
    </FormProvider>
  );
};
