import { Global } from "@emotion/react";
import { Cancel, PivotTableChart } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";
import {
  type MRT_ColumnDef,
  MRT_FullScreenToggleButton,
  MRT_ShowHideColumnsButton,
  type MRT_TableInstance,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
} from "material-react-table";
import React, { useState } from "react";

import { errorWithData } from "../../../../common/errorHandling";
import { Loading } from "../../../common/components/Loading/Loading";
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

interface FilterDetails {
  rowTitles: string[];
  rowType: "criteria" | "solutions";
}

const buildColumns = (
  problemNode: Node,
  columnNodes: Node[],
  filterDetails: FilterDetails
): MRT_ColumnDef<RowData>[] => {
  return [
    {
      accessorKey: "rowNode.data.label", // this determines how cols should sort/filter
      header: filterDetails.rowType,
      Header: <NodeCell node={problemNode} />,
      filterVariant: "multi-select",
      filterSelectOptions: filterDetails.rowTitles,
      enableHiding: false,
      Cell: ({ row }) => {
        return <NodeCell node={row.original.rowNode as Node} />;
      },
    },
    ...columnNodes.map(
      (columnNode) =>
        ({
          accessorKey: `${columnNode.id}.data.score`, // we'll sort/filter edges by their score for now I guess
          header: columnNode.data.label,
          Header: <NodeCell node={columnNode} />,
          enableColumnFilter: false,
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

  if (!problemNode) return <Loading />;

  const criteria = nodeChildren.filter((node) => node.type === "criterion");
  const solutions = nodeChildren.filter((node) => node.type === "solution");

  const rowNodes = useSolutionsForColumns ? criteria : solutions;
  const columnNodes = useSolutionsForColumns ? solutions : criteria;

  const filterDetails = {
    rowTitles: rowNodes.map((node) => node.data.label),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- hmm casting is necessary for some reason
    rowType: (useSolutionsForColumns ? "criteria" : "solutions") as "criteria" | "solutions",
  };

  const rowData = buildRows(rowNodes, columnNodes, criterionSolutionEdges);
  const columnData = buildColumns(problemNode, columnNodes, filterDetails);

  const ToolBarActions = (table: MRT_TableInstance<RowData>) => {
    return (
      <>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />

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
          relation={{ child: "criterion", name: "criterionFor", parent: "problem" }}
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
        initialState={{
          columnPinning: { left: ["rowNode.data.label"] },
          // columnOrder is defaulted to all cols, but then we'd have to maintain columnOrder when new cols are added
          // defaulting this to empty should be fine until we want column reordering, then I think we'll have to maintain that
          // manually, in order to have new columns included (new columns i.e. from transposing)
          columnOrder: [],
        }}
      />
    </>
  );
};
