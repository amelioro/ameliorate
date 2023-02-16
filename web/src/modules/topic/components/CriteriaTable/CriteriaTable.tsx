import { Global } from "@emotion/react";
import { Typography } from "@mui/material";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";

import { useCriterionSolutionEdges, useNode, useNodeChildren } from "../../store/nodeHooks";
import { problemDiagramId } from "../../store/store";
import { Edge, Node } from "../../utils/diagram";
import { EdgeCell } from "../EdgeCell/EdgeCell";
import { EditableNode } from "../EditableNode/EditableNode";
import { NodeCell } from "../NodeCell/NodeCell";
import { TitleDiv, tableStyles } from "./CriteriaTable.styles";

const getCriterionSolutionEdge = (criterion: Node, solution: Node, edges: Edge[]) => {
  const edge = edges.find((edge) => edge.source === criterion.id && edge.target === solution.id);
  if (!edge) throw new Error(`No edge found between ${criterion.id} and ${solution.id}`);

  return edge;
};

type RowData = Record<string, Node | Edge>;

// returns structure:
// {
//   criterion: Node,
//   [solution_id: string]: Edge,
// }
// but not sure how to type this because index signatures require _all_ properties to match the specified type
const buildRows = (
  criteria: Node[],
  solutions: Node[],
  criterionSolutionEdges: Edge[]
): RowData[] => {
  return criteria.map((criterion) => {
    return {
      criterion,
      ...Object.fromEntries(
        solutions.map((solution) => [
          solution.id,
          getCriterionSolutionEdge(criterion, solution, criterionSolutionEdges),
        ])
      ),
    };
  });
};

const buildColumns = (solutions: Node[]): MRT_ColumnDef<RowData>[] => {
  return [
    {
      accessorKey: "criterion.data.label", // this is used for sorting/filtering, right?
      header: "", // corner column header, and solutions are along the top
      Cell: ({ row }) => <NodeCell node={row.original.criterion as Node} />,
    },
    ...solutions.map(
      (solution) =>
        ({
          accessorKey: `${solution.id}.data.score`, // we'll sort/filter edges by their score for now I guess
          header: "Score",
          Header: <NodeCell node={solution} />,
          Cell: ({ row }) => <EdgeCell edge={row.original[solution.id] as Edge} />,
        } as MRT_ColumnDef<RowData>)
    ),
  ];
};

interface Props {
  problemNodeId: string;
}

export const CriteriaTable = ({ problemNodeId }: Props) => {
  const problemNode = useNode(problemNodeId, problemDiagramId);
  const nodeChildren = useNodeChildren(problemNodeId, problemDiagramId);
  const criterionSolutionEdges = useCriterionSolutionEdges(problemNodeId, problemDiagramId);

  if (!problemNode) return <p>loading...</p>;

  const criteria = nodeChildren.filter((node) => node.type === "criterion");
  const solutions = nodeChildren.filter((node) => node.type === "solution");

  const rowData = buildRows(criteria, solutions, criterionSolutionEdges);
  const columns = buildColumns(solutions);

  return (
    <>
      <TitleDiv>
        <Typography variant="h4">Criteria for solving:</Typography>
        {/* rename table cell to "not react flow"? */}
        <EditableNode node={problemNode} />
      </TitleDiv>

      {/* Hard to tell if material-react-table is worth using because the cells are all custom components. */}
      {/* It's doubtful that we'll use sorting/filtering... but pinning and re-ordering may come in handy. */}
      <MaterialReactTable
        columns={columns}
        data={rowData}
        enableColumnActions={false}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        enableSorting={false}
        muiTablePaperProps={{
          className: "criteria-table-paper",
        }}
      />
      <Global styles={tableStyles(columns.length)} />
    </>
  );
};
