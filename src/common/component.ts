import { type Relation } from "@/common/edge";

export const composedRelations: Relation[] = [
  { source: "solution", name: "has", target: "solutionComponent" },
];

export const componentTypes = composedRelations.map((relation) => relation.target);
