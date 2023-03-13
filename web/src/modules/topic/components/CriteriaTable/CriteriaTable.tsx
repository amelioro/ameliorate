import { Global } from "@emotion/react";
import { Cancel, PivotTableChart } from "@mui/icons-material";
import { Typography } from "@mui/material";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import { useState } from "react";

import { closeTable } from "../../store/actions";
import { useCriterionSolutionEdges, useNode, useNodeChildren } from "../../store/nodeHooks";
import { problemDiagramId } from "../../store/store";
import { Edge, Node } from "../../utils/diagram";
import { getConnectingEdge } from "../../utils/edge";
import { EdgeCell } from "../CriteriaTable/EdgeCell";
import { NodeCell } from "../CriteriaTable/NodeCell";
import { EditableNode } from "../Node/EditableNode";
import {
  PositionedAddNodeButton,
  PositionedCloseButton,
  StyledTransposeTableButton,
  TableDiv,
  TitleDiv,
  tableStyles,
} from "./CriteriaTable.styles";

type RowData = Record<string, Node | Edge>;

// returns structure:
// {
//   criterion: Node,
//   [solution_id: string]: Edge,
// }
// but not sure how to type this because index signatures require _all_ properties to match the specified type

const buildRows = (rowNodes: Node[], columnNodes: Node[], edges: Edge[]): RowData[] => {
  return rowNodes.map((rowNode) => {
    return {
      rowNode,
      ...Object.fromEntries(
        columnNodes.map((columnNode) => {
          const edge = getConnectingEdge(rowNode, columnNode, edges);
          if (!edge) throw new Error(`No edge found between ${rowNode.id} and ${columnNode.id}`);

          return [columnNode.id, edge];
        })
      ),
    };
  });
};

const buildColumns = (columnNodes: Node[]): MRT_ColumnDef<RowData>[] => {
  return [
    {
      accessorKey: "rowNode.data.label", // this determines how cols should sort/filter
      header: "", // corner column header, and solutions are along the top
      Cell: ({ row }) => {
        return <NodeCell node={row.original.rowNode as Node} />;
      },
    },
    ...columnNodes.map(
      (columnNode) =>
        ({
          accessorKey: `${columnNode.id}.data.score`, // we'll sort/filter edges by their score for now I guess
          header: "",
          Header: <NodeCell node={columnNode} />,
          Cell: ({ row }) => <EdgeCell edge={row.original[columnNode.id] as Edge} />,
        } as MRT_ColumnDef<RowData>)
    ),
  ];
};

interface Props {
  problemNodeId: string;
}

export const CriteriaTable = ({ problemNodeId }: Props) => {
  const [useSolutionsForColumns, setUseSolutionsForColumns] = useState<boolean>(true);
  const problemNode = useNode(problemNodeId, problemDiagramId);
  const nodeChildren = useNodeChildren(problemNodeId, problemDiagramId);
  const criterionSolutionEdges = useCriterionSolutionEdges(problemNodeId, problemDiagramId);

  if (!problemNode) return <p>loading...</p>;

  const criteria = nodeChildren.filter((node) => node.type === "criterion");
  const solutions = nodeChildren.filter((node) => node.type === "solution");

  const rowNodes = useSolutionsForColumns ? criteria : solutions;
  const columnNodes = useSolutionsForColumns ? solutions : criteria;

  const rowData = buildRows(rowNodes, columnNodes, criterionSolutionEdges);
  const columnData = buildColumns(columnNodes);

  return (
    <>
      <PositionedCloseButton onClick={() => closeTable()} color="primary">
        <Cancel />
      </PositionedCloseButton>

      <TitleDiv>
        <Typography variant="h4">Criteria for solving:</Typography>
        <EditableNode node={problemNode} />
      </TitleDiv>

      <TableDiv numberOfColumns={columnData.length}>
        {/* Hard to tell if material-react-table is worth using because the cells are all custom components. */}
        {/* It's doubtful that we'll use sorting/filtering... but pinning and re-ordering may come in handy. */}
        <MaterialReactTable
          columns={columnData}
          data={rowData}
          enableColumnActions={false}
          enablePagination={false}
          enableBottomToolbar={false}
          enableTopToolbar={false}
          enableSorting={false}
          muiTablePaperProps={{
            className: "criteria-table-paper",
          }}
          initialState={{ columnPinning: { left: ["rowNode.data.label"] } }}
        />

        <StyledTransposeTableButton
          size="small"
          variant="contained"
          color="neutral"
          onClick={() => setUseSolutionsForColumns(!useSolutionsForColumns)}
        >
          <PivotTableChart />
        </StyledTransposeTableButton>

        <PositionedAddNodeButton
          position={useSolutionsForColumns ? "column" : "row"}
          fromNodeId={problemNodeId}
          as="child"
          toNodeType="criterion"
          relation="criterion for"
        />

        <PositionedAddNodeButton
          position={useSolutionsForColumns ? "row" : "column"}
          fromNodeId={problemNodeId}
          as="child"
          toNodeType="solution"
          relation="solves"
        />
      </TableDiv>

      <Global styles={tableStyles} />
    </>
  );
};
