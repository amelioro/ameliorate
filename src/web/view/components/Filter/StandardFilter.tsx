import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { InfoCategory } from "@/common/infoCategory";
import { deepIsEqual } from "@/common/utils";
import { FormContext } from "@/web/common/components/Form/FormContext";
import { NodeSelect } from "@/web/common/components/Form/NodeSelect";
import { NumberInput } from "@/web/common/components/Form/NumberInput";
import { Select } from "@/web/common/components/Form/Select";
import { useCriteria, useNodesOfType, useSolutions } from "@/web/topic/diagramStore/nodeHooks";
import {
  getStandardFilterWithFallbacks,
  setStandardFilter,
} from "@/web/view/currentViewStore/filter";
import {
  StandardFilter as StandardFilterData,
  infoStandardFilterTypes,
  problemDetails,
  standardFilterSchema,
  standardFilterSchemasByType,
} from "@/web/view/utils/infoFilter";

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
export const StandardFilter = ({ infoCategory, filter }: Props) => {
  const filterWithFallbacks = getStandardFilterWithFallbacks(filter);

  const methods = useForm<StandardFilterData>({
    resolver: zodResolver(standardFilterSchema),
    defaultValues: filterWithFallbacks,
  });
  const { getValues, handleSubmit, reset, watch } = methods;

  const filterTypes = infoStandardFilterTypes[infoCategory];

  const type = watch("type");
  const typeSchemaShape = standardFilterSchemasByType[type].shape;

  const useProblems = () => useNodesOfType("problem");
  const useQuestions = () => useNodesOfType("question");
  const useSources = () => useNodesOfType("source");
  const useRootClaims = () => useNodesOfType("rootClaim");

  const centralProblemId = watch("centralProblemId");
  const useProblemSolutions = () => useSolutions(centralProblemId);
  const useProblemCriteria = () => useCriteria(centralProblemId);

  const submit = useCallback(() => {
    void handleSubmit((data) => setStandardFilter(infoCategory, data))();
  }, [handleSubmit, infoCategory]);

  // update form when filter changes externally e.g. via undo/redo
  useEffect(() => {
    if (deepIsEqual(filterWithFallbacks, getValues())) return;
    reset(filterWithFallbacks);
  }, [filterWithFallbacks, getValues, reset]);

  return (
    // FormProvider is used to enable useController in extracted form components without passing `control`
    <FormProvider {...methods}>
      <FormContext.Provider value={{ submit }}>
        <form style={{ padding: "8px" }}>
          <Stack spacing={1.5}>
            <Select name="type" label="Standard Filter" options={filterTypes} />

            {"layersDeep" in typeSchemaShape && <NumberInput name="layersDeep" min={0} max={10} />}

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
              <NodeSelect
                name="centralSourceId"
                label="Central Source"
                useNodeOptions={useSources}
              />
            )}
            {"centralRootClaimId" in typeSchemaShape && (
              <NodeSelect
                name="centralRootClaimId"
                label="Central Root Claim"
                useNodeOptions={useRootClaims}
              />
            )}
          </Stack>
        </form>
      </FormContext.Provider>
    </FormProvider>
  );
};
