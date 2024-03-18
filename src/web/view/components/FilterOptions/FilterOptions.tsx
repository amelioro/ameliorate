import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { NodeType, researchNodeTypes, topicNodeTypes } from "../../../../common/node";
import { NodeSelect } from "../../../common/components/Form/NodeSelect";
import { Select } from "../../../common/components/Form/Select";
import { Switch } from "../../../common/components/Form/Switch";
import { getNodes } from "../../../topic/store/nodeGetters";
import {
  useCriteria,
  useProblems,
  useQuestions,
  useSolutions,
  useSources,
} from "../../../topic/store/nodeHooks";
import { Score, possibleScores } from "../../../topic/utils/graph";
import { setFilterOptions, useFilterOptions } from "../../navigateStore";
import {
  FilterTypes,
  ScoredComparer,
  filterOptionsSchema,
  filterSchemas,
  researchFilterTypes,
  scoredComparers,
  topicFilterTypes,
} from "../../utils/filter";
import { ShowSecondaryNeighborsLabel } from "./ShowSecondaryNeighborsLabel";

type ValidatedFormData = z.infer<typeof filterOptionsSchema>;

// how to build this based on schemas? .merge doesn't work because `type` is overridden by the last schema's literal
interface FormData {
  nodeTypes: NodeType[];
  showOnlyScored: boolean;
  scoredComparer: ScoredComparer;
  scoreToCompare: Score;
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
  activeDiagram: "topicDiagram" | "researchDiagram";
}

/**
 * Features:
 * - Tracks filter options per diagram, so that you can quickly switch between diagrams without losing filter
 * - Reuses field values across filters (e.g. central problem retains value when switching filter type)
 * - Defaults field values based on nodes that exist in the diagram
 * - Shows field components and validates based on filter type
 */
export const FilterOptions = ({ activeDiagram }: Props) => {
  const filterOptions = useFilterOptions(activeDiagram);

  // exclusively used for defaulting, and not ideal because child Select components use these through hooks again anyway
  // not sure how to allow the child components to be responsible for default values for the form
  const problems = getNodes("problem"); // could consider selecting causes here, but probably don't want causes as options for tradeoffs filter
  const allSolutions = getNodes("solution");
  const questions = getNodes("question");
  const sources = getNodes("source");

  const methods = useForm<FormData>({
    resolver: zodResolver(filterOptionsSchema),
    defaultValues: {
      ...filterOptions,
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
  const { handleSubmit, watch } = methods;

  const filterNodeTypes = activeDiagram === "topicDiagram" ? topicNodeTypes : researchNodeTypes;
  const filterTypes = activeDiagram === "topicDiagram" ? topicFilterTypes : researchFilterTypes;

  const type = watch("type");
  const typeSchemaShape = filterSchemas[type].shape;

  const centralProblemId = watch("centralProblemId");
  const useProblemSolutions = () => useSolutions(centralProblemId);
  const useProblemCriteria = () => useCriteria(centralProblemId);

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
          <Select name="nodeTypes" options={filterNodeTypes} multiple />

          <Stack direction="row" spacing={1}>
            <Switch name="showOnlyScored" label="Show only nodes scored" />
            <Select name="scoredComparer" options={scoredComparers} label="" width="50px" />
            <Select name="scoreToCompare" options={possibleScores} label="" width="50px" />
          </Stack>

          <Switch name="showSecondaryNeighbors" label={<ShowSecondaryNeighborsLabel />} />
          <Select name="type" label="Standard Filter" options={filterTypes} />

          {"centralProblemId" in filterSchemas[type].shape && (
            <NodeSelect
              name="centralProblemId"
              label="Central Problem"
              useNodeOptions={useProblems}
            />
          )}

          {"showCauses" in filterSchemas[type].shape && <Switch name="showCauses" />}
          {"showEffects" in filterSchemas[type].shape && <Switch name="showEffects" />}
          {"showCriteria" in filterSchemas[type].shape && <Switch name="showCriteria" />}
          {"showSolutions" in filterSchemas[type].shape && <Switch name="showSolutions" />}

          {"centralSolutionId" in filterSchemas[type].shape && (
            <NodeSelect
              name="centralSolutionId"
              label="Central Solution"
              useNodeOptions={useSolutions}
            />
          )}
          {"detail" in typeSchemaShape && (
            // TODO: build options with Pascal Case
            <Select
              name="detail"
              options={typeSchemaShape.detail.options.map((option) => option.value)}
            />
          )}
          {"solutions" in filterSchemas[type].shape && (
            <NodeSelect name="solutions" useNodeOptions={useProblemSolutions} multiple />
          )}
          {"criteria" in filterSchemas[type].shape && (
            <NodeSelect name="criteria" useNodeOptions={useProblemCriteria} multiple />
          )}
          {"centralQuestionId" in filterSchemas[type].shape && (
            <NodeSelect
              name="centralQuestionId"
              label="Central Question"
              useNodeOptions={useQuestions}
            />
          )}
          {"centralSourceId" in filterSchemas[type].shape && (
            <NodeSelect name="centralSourceId" label="Central Source" useNodeOptions={useSources} />
          )}
        </Stack>
      </form>
    </FormProvider>
  );
};
