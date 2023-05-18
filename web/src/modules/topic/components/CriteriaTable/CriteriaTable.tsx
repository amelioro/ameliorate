import { Global } from "@emotion/react";
import { Cancel, PivotTableChart } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";
import MaterialReactTable, {
  type MRT_ColumnDef,
  MRT_FullScreenToggleButton,
  type MRT_TableInstance,
  MRT_ToggleGlobalFilterButton,
} from "material-react-table";
import React, { useState } from "react";

import { errorWithData } from "../../../../common/errorHandling";
import { useCriterionSolutionEdges, useNode, useNodeChildren } from "../../store/nodeHooks";
import { closeTable } from "../../store/viewActions";
import { Edge, Node, problemDiagramId } from "../../utils/diagram";
import { getConnectingEdge } from "../../utils/edge";
import { EdgeCell } from "../CriteriaTable/EdgeCell";
import { NodeCell } from "../CriteriaTable/NodeCell";
import { AddNodeButton } from "../Node/AddNodeButton";
import { tableStyles } from "./CriteriaTable.styles";

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
          if (!edge) {
            throw errorWithData(`No edge found between ${rowNode.id} and ${columnNode.id}`, edges);
          }

          return [columnNode.id, edge];
        })
      ),
    };
  });
};

const buildColumns = (problemNode: Node, columnNodes: Node[]): MRT_ColumnDef<RowData>[] => {
  return [
    {
      accessorKey: "rowNode.data.label", // this determines how cols should sort/filter
      header: "", // corner column header, and solutions are along the top
      Header: <NodeCell node={problemNode} />,
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
  const columnData = buildColumns(problemNode, columnNodes);

  const ToolBarActions = (table: MRT_TableInstance<RowData>) => {
    return (
      <>
        <MRT_ToggleGlobalFilterButton table={table}></MRT_ToggleGlobalFilterButton>

        <AddNodeButton
          fromNodeId={problemNodeId}
          as="child"
          toNodeType="solution"
          relation={{ child: "solution", name: "addresses", parent: "problem" }}
        />

        <AddNodeButton
          fromNodeId={problemNodeId}
          as="child"
          toNodeType="criterion"
          relation={{ child: "criterion", name: "criterion for", parent: "problem" }}
        />

        <Tooltip title="Transpose Table">
          <Button
            size="small"
            variant="contained"
            color="neutral"
            onClick={() => setUseSolutionsForColumns(!useSolutionsForColumns)}
          >
            <PivotTableChart />
          </Button>
        </Tooltip>

        <MRT_FullScreenToggleButton table={table} />
        <Tooltip title="Close">
          <IconButton onClick={() => closeTable()} color="primary">
            <Cancel />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  return (
    <>
      <Global styles={tableStyles} />

      <MaterialReactTable
        columns={columnData}
        data={rowData}
        enableColumnActions={false}
        enablePagination={false}
        enableBottomToolbar={false}
        renderToolbarInternalActions={({ table }) => ToolBarActions(table)}
        enableSorting={false}
        enableStickyHeader={true}
        // not very well documented in the library, but this drop zone takes up space for unknown reasons.
        positionToolbarDropZone="none"
        muiTablePaperProps={{
          className: "criteria-table-paper",
        }}
        initialState={{ columnPinning: { left: ["rowNode.data.label"] } }}
      />
    </>
  );
};
