import { describe, expect, it } from "vitest";

import { migrate } from "@/web/topic/diagramStore/migrate";
import { DiagramStoreState } from "@/web/topic/diagramStore/store";
import { buildEdge, buildNode } from "@/web/topic/utils/graph";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe("diagram store migrate", () => {
  it("canonicalizes legacy relations when migrating from version 25", () => {
    // breakdown
    const problem = buildNode({ id: "node-problem", type: "problem" });
    const subproblem = buildNode({ id: "node-subproblem", type: "problem" });
    const cause = buildNode({ id: "node-cause", type: "cause" });
    const detriment = buildNode({ id: "node-detriment", type: "detriment" });
    const benefit = buildNode({ id: "node-benefit", type: "benefit" });
    const solution = buildNode({ id: "node-solution", type: "solution" });
    const component = buildNode({ id: "node-solution-component", type: "solutionComponent" });
    const obstacle = buildNode({ id: "node-obstacle", type: "obstacle" });

    // justification/research
    const rootClaim = buildNode({ id: "node-root-claim", type: "rootClaim" });
    const support = buildNode({ id: "node-support", type: "support" });
    const question = buildNode({ id: "node-question", type: "question" });

    const legacyState = {
      nodes: [
        problem,
        subproblem,
        cause,
        detriment,
        benefit,
        solution,
        component,
        obstacle,
        rootClaim,
        support,
        question,
      ],
      edges: [
        buildEdge({
          id: "edge-subproblem",
          sourceId: problem.id,
          targetId: subproblem.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- needed to bypass type checking for legacy data
          relation: "subproblemOf" as unknown as any,
        }),
        buildEdge({
          id: "edge-created-by",
          sourceId: problem.id,
          targetId: detriment.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- needed to bypass type checking for legacy data
          relation: "createdBy" as unknown as any,
        }),
        buildEdge({
          id: "edge-creates",
          sourceId: benefit.id,
          targetId: solution.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- needed to bypass type checking for legacy data
          relation: "creates" as unknown as any,
        }),
        buildEdge({
          id: "edge-obstacle",
          sourceId: obstacle.id,
          targetId: solution.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- needed to bypass type checking for legacy data
          relation: "obstacleOf" as unknown as any,
        }),
        buildEdge({
          id: "edge-causes",
          sourceId: problem.id,
          targetId: cause.id,
          relation: "causes",
        }),
        buildEdge({
          id: "edge-has",
          sourceId: component.id,
          targetId: solution.id,
          relation: "has",
        }),
        // justification/research
        buildEdge({
          id: "edge-supports",
          sourceId: rootClaim.id,
          targetId: support.id,
          relation: "supports",
        }),
        buildEdge({
          id: "edge-asksAbout",
          sourceId: problem.id,
          targetId: question.id,
          relation: "asksAbout",
        }),
        // relatesTo as well
        buildEdge({
          id: "edge-relates-to",
          sourceId: problem.id,
          targetId: solution.id,
          relation: "relatesTo",
        }),
      ],
      userScores: {},
    } as const;

    const migrated = migrate(clone(legacyState), 25) as DiagramStoreState;

    expect(migrated.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "edge-subproblem",
          label: "has",
          source: problem.id,
          target: subproblem.id,
        }),
        expect.objectContaining({
          id: "edge-created-by",
          label: "causes",
          source: problem.id,
          target: detriment.id,
        }),
        expect.objectContaining({
          id: "edge-creates",
          label: "causes",
          source: solution.id,
          target: benefit.id,
        }),
        expect.objectContaining({
          id: "edge-obstacle",
          label: "impedes",
          source: obstacle.id,
          target: solution.id,
        }),
        expect.objectContaining({
          id: "edge-causes",
          label: "causes",
          source: cause.id,
          target: problem.id,
        }),
        expect.objectContaining({
          id: "edge-has",
          label: "has",
          source: solution.id,
          target: component.id,
        }),
        // justification/research
        expect.objectContaining({
          id: "edge-supports",
          label: "supports",
          source: support.id,
          target: rootClaim.id,
        }),
        expect.objectContaining({
          id: "edge-asksAbout",
          label: "asksAbout",
          source: question.id,
          target: problem.id,
        }),
        // relatesTo as well
        expect.objectContaining({
          id: "edge-relates-to",
          label: "relatesTo",
          source: solution.id,
          target: problem.id,
        }),
      ]),
    );
  });
});
