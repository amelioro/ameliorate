import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { InfoCategory } from "../../../../common/infoCategory";
import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { Select } from "../../../common/components/Form/Select";
import {
  useCriteria,
  useProblems,
  useQuestions,
  useSolutions,
  useSources,
} from "../../../topic/store/nodeHooks";
import { getStandardFilterWithFallbacks, setStandardFilter } from "../../navigateStore";
import {
  StandardFilter as StandardFilterData,
  infoStandardFilterTypes,
  problemDetails,
  standardFilterSchema,
  standardFilterSchemasByType,
} from "../../utils/diagramFilter";

interface Props {
  infoCategory: InfoCategory;
  filter: StandardFilterData;
}

/**
 * Features:
 * - Reuses field values across filters (e.g. central problem retains value when switching filter type)
 * - Defaults field values based on nodes that exist in the diagram
 * - Shows field components and validates based on filter type
 */
export const StandardFilter = ({ infoCategory }: Props) => {
  const filter = getStandardFilterWithFallbacks(infoCategory);

  const methods = useForm<StandardFilterData>({
    resolver: zodResolver(standardFilterSchema),
    defaultValues: filter,
  });
  const { handleSubmit, watch } = methods;

  const filterTypes = infoStandardFilterTypes[infoCategory];

  const type = watch("type");
  const typeSchemaShape = standardFilterSchemasByType[type].shape;

  const centralProblemId = watch("centralProblemId");
  const useProblemSolutions = () => useSolutions(centralProblemId);
  const useProblemCriteria = () => useCriteria(centralProblemId);

  useEffect(() => {
    // trigger submit every time the form changes
    const subscription = watch(
      () =>
        void handleSubmit((data) => {
          setStandardFilter(infoCategory, data);
        })()
    );

    return subscription.unsubscribe;
  }, [handleSubmit, infoCategory, watch]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <form style={{ padding: "8px" }}>
        <Stack spacing={1.5}>
          <Select name="type" label="Standard Filter" options={filterTypes} />

          {"centralProblemId" in typeSchemaShape && (
            <NodeSelect
              name="centralProblemId"
              label="Central Problem"
              useNodeOptions={useProblems}
            />
          )}

          {"problemDetails" in typeSchemaShape && (
            <Select name="problemDetails" options={problemDetails} multiple />
          )}

          {"centralSolutionId" in typeSchemaShape && (
            <NodeSelect
              name="centralSolutionId"
              label="Central Solution"
              useNodeOptions={useSolutions}
            />
          )}
          {"solutionDetail" in typeSchemaShape && (
            // TODO: build options with Pascal Case
            <Select
              name="solutionDetail"
              options={typeSchemaShape.solutionDetail.options.map((option) => option)}
            />
          )}
          {"solutions" in typeSchemaShape && (
            <NodeSelect name="solutions" useNodeOptions={useProblemSolutions} multiple />
          )}
          {"criteria" in typeSchemaShape && (
            <NodeSelect name="criteria" useNodeOptions={useProblemCriteria} multiple />
          )}
          {"centralQuestionId" in typeSchemaShape && (
            <NodeSelect
              name="centralQuestionId"
              label="Central Question"
              useNodeOptions={useQuestions}
            />
          )}
          {"centralSourceId" in typeSchemaShape && (
            <NodeSelect name="centralSourceId" label="Central Source" useNodeOptions={useSources} />
          )}
        </Stack>
      </form>
    </FormProvider>
  );
};
