import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { nodeTypes } from "../../../../common/node";
import { Select } from "../../../common/components/Form/Select";
import { Switch } from "../../../common/components/Form/Switch";
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
