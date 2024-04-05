export {};
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Stack } from "@mui/material";
// import { useEffect } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { z } from "zod";

// import { NodeType, researchNodeTypes, structureNodeTypes } from "../../../../common/node";
// import { NodeSelect } from "../../../common/components/Form/NodeSelect";
// import { Select } from "../../../common/components/Form/Select";
// import { Switch } from "../../../common/components/Form/Switch";
// import { getNodes } from "../../../topic/store/nodeGetters";
// import {
//   useCriteria,
//   useProblems,
//   useQuestions,
//   useSolutions,
//   useSources,
// } from "../../../topic/store/nodeHooks";
// import { Score, possibleScores } from "../../../topic/utils/graph";
// import { setFilters, useFilters } from "../../navigateStore";
// import {
//   DetailType,
//   DiagramFilterTypes,
//   ProblemDetail,
//   diagramFilterSchema,
//   diagramFilterSchemas,
//   problemDetails,
//   researchFilterTypes,
//   topicFilterTypes,
// } from "../../utils/diagramFilter";
// import { ShowSecondaryNeighborsLabel } from "./ShowSecondaryNeighborsLabel";

// type ValidatedFormData = z.infer<typeof diagramFilterSchema>;

// // how to build this based on schemas? .merge doesn't work because `type` is overridden by the last schema's literal
// interface FormData {
//   nodeTypes: NodeType[];
//   showOnlyScored: boolean;
//   scoredComparer: ScoredComparer;
//   scoreToCompare: Score;
//   showSecondaryNeighbors: boolean;
//   type: DiagramFilterTypes;
//   centralProblemId?: string;
//   problemDetails: ProblemDetail[];
//   centralSolutionId?: string;
//   solutionDetail: DetailType;
//   solutions: string[];
//   criteria: string[];
//   centralQuestionId?: string;
//   centralSourceId?: string;
// }

// /**
//  * Helper to grab properties from an object whose type isn't narrow enough to know that the property exists.
//  *
//  * @returns the value of the property if the object exists with it, otherwise the default value
//  */
// const getProp = <T,>(obj: object | null, prop: string, defaultValue: T): T => {
//   if (!obj || !(prop in obj)) return defaultValue;
//   const value = (obj as Record<string, T>)[prop];
//   return value ?? defaultValue;
// };

// interface Props {
//   activeDiagram: "topicDiagram" | "researchDiagram";
// }

// // TODO: update this comment
// /**
//  * Features:
//  * - Tracks filter options per diagram, so that you can quickly switch between diagrams without losing filter
//  * - Reuses field values across filters (e.g. central problem retains value when switching filter type)
//  * - Defaults field values based on nodes that exist in the diagram
//  * - Shows field components and validates based on filter type
//  */
// export const StandardFilter = ({ activeDiagram }: Props) => {
//   const filters = useFilters(activeDiagram);

//   // exclusively used for defaulting, and not ideal because child Select components use these through hooks again anyway
//   // not sure how to allow the child components to be responsible for default values for the form
//   const problems = getNodes("problem"); // could consider selecting causes here, but probably don't want causes as options for tradeoffs filter
//   const allSolutions = getNodes("solution");
//   const questions = getNodes("question");
//   const sources = getNodes("source");

//   const methods = useForm<FormData>({
//     resolver: zodResolver(diagramFilterSchema),
//     defaultValues: {
//       ...filters,
//       centralProblemId: getProp<string | undefined>(filters, "centralProblemId", problems[0]?.id),
//       problemDetails: getProp<ProblemDetail[]>(filters, "problemDetails", [
//         "causes",
//         "effects",
//         "subproblems",
//         "criteria",
//         "solutions",
//       ]),
//       centralSolutionId: getProp<string | undefined>(
//         filters,
//         "centralSolutionId",
//         allSolutions[0]?.id
//       ),
//       solutionDetail: getProp<"all" | "connectedToCriteria" | "none">(filters, "detail", "all"),
//       solutions: getProp<string[]>(filters, "solutions", []),
//       // TODO?: ideally this defaults to all criteria so that empty can mean no criteria displayed,
//       // but we can't rely on `watch("centralProblemId")` with `useCriteria(centralProblemId)` since
//       // watch isn't usable until after form definition. Potentially could move all defaults to
//       // be specified on their component, but that's annoying and we'd also have to handle the first
//       // render, during which `watch` is undefined.
//       criteria: getProp<string[]>(filters, "criteria", []),
//       centralQuestionId: getProp<string | undefined>(
//         filters,
//         "centralQuestionId",
//         questions[0]?.id
//       ),
//       centralSourceId: getProp<string | undefined>(filters, "centralSourceId", sources[0]?.id),
//     },
//   });
//   const { handleSubmit, watch } = methods;

//   const filterTypes = activeDiagram === "topicDiagram" ? topicFilterTypes : researchFilterTypes;

//   const type = watch("type");
//   const typeSchemaShape = diagramFilterSchemas[type].shape;

//   const centralProblemId = watch("centralProblemId");
//   const useProblemSolutions = () => useSolutions(centralProblemId);
//   const useProblemCriteria = () => useCriteria(centralProblemId);

//   useEffect(() => {
//     // trigger submit every time the form changes
//     const subscription = watch(
//       () =>
//         void handleSubmit((data) => {
//           // We know that zod has validated the data by this point.
//           // `FormData` is used for the form's data type so that form `errors` type has all props;
//           // without this, `errors` only knows the props that intersect all the schemas, i.e. `type`.
//           setFilters(data as ValidatedFormData);
//         })()
//     );

//     return subscription.unsubscribe;
//   }, [handleSubmit, watch]);

//   return (
//     // FormProvider is used to enable useController in extracted form components without passing `control`
//     <FormProvider {...methods}>
//       <form style={{ padding: "8px" }}>
//         <Stack spacing={1.5}>
//           <Select name="type" label="Standard Filter" options={filterTypes} />

//           {"centralProblemId" in diagramFilterSchemas[type].shape && (
//             <NodeSelect
//               name="centralProblemId"
//               label="Central Problem"
//               useNodeOptions={useProblems}
//             />
//           )}

//           {"problemDetails" in diagramFilterSchemas[type].shape && (
//             <Select name="problemDetails" options={problemDetails} multiple />
//           )}

//           {"centralSolutionId" in diagramFilterSchemas[type].shape && (
//             <NodeSelect
//               name="centralSolutionId"
//               label="Central Solution"
//               useNodeOptions={useSolutions}
//             />
//           )}
//           {"solutionDetail" in typeSchemaShape && (
//             // TODO: build options with Pascal Case
//             <Select
//               name="solutionDetail"
//               options={typeSchemaShape.solutionDetail.options.map((option) => option)}
//             />
//           )}
//           {"solutions" in diagramFilterSchemas[type].shape && (
//             <NodeSelect name="solutions" useNodeOptions={useProblemSolutions} multiple />
//           )}
//           {"criteria" in diagramFilterSchemas[type].shape && (
//             <NodeSelect name="criteria" useNodeOptions={useProblemCriteria} multiple />
//           )}
//           {"centralQuestionId" in diagramFilterSchemas[type].shape && (
//             <NodeSelect
//               name="centralQuestionId"
//               label="Central Question"
//               useNodeOptions={useQuestions}
//             />
//           )}
//           {"centralSourceId" in diagramFilterSchemas[type].shape && (
//             <NodeSelect name="centralSourceId" label="Central Source" useNodeOptions={useSources} />
//           )}
//         </Stack>
//       </form>
//     </FormProvider>
//   );
// };
