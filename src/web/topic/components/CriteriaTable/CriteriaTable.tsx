import { Global } from "@emotion/react";
import { Cancel, PivotTableChart } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";
import {
  type MRT_ColumnDef,
  MRT_FullScreenToggleButton,
  type MRT_TableInstance,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
} from "material-react-table";
import React, { useState } from "react";

import { errorWithData } from "../../../../common/errorHandling";
import { Loading } from "../../../common/components/Loading/Loading";
import { useSessionUser } from "../../../common/hooks";
import { closeTable, useFilterOptions } from "../../../view/navigateStore";
import { applyScoreFilter, getSelectedTradeoffNodes } from "../../../view/utils/filter";
import { useCriterionSolutionEdges, useNode, useNodeChildren } from "../../store/nodeHooks";
import { useDisplayScores } from "../../store/scoreHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { getConnectingEdge } from "../../utils/edge";
import { Edge, Node } from "../../utils/graph";
import { EdgeCell } from "../CriteriaTable/EdgeCell";
import { NodeCell } from "../CriteriaTable/NodeCell";
import { AddNodeButton } from "../Node/AddNodeButton";
import { tableStyles } from "./CriteriaTable.styles";
import { SolutionTotalCell } from "./SolutionTotalCell";
import { TotalsHeaderCell } from "./TotalsHeaderCell";

interface RowData {
  rowHeader: HeaderCell;
  rowHeaderLabel: string;
  cells: Cell[];
}

interface Cell {
  data: Node | Edge | string; // string for totals row

  // use function instead of prop because `MRT_ColumnDef` will calculate all possible `accessorKey`
  // values, based on the RowData props, and `ReactNode` has too many possible recursing Children props
  render: () => React.ReactNode;
}

interface HeaderCell extends Cell {
  id: string;
  label: string;
}

const buildNodeHeader = (node: Node): HeaderCell => {
  return {
    id: node.id,
    label: node.data.label,
    data: node,
    render: () => <NodeCell node={node} />,
  };
};

const buildEdgeCell = (edge: Edge): Cell => {
  return {
    data: edge,
    render: () => <EdgeCell edge={edge} />,
  };
};

const buildTotalsHeader = (): HeaderCell => {
  return {
    id: "totals",
    label: "Solution Totals",
    data: "totals",
    render: () => <TotalsHeaderCell />,
  };
};

const buildSolutionTotalCell = (solution: Node, problem: Node): Cell => {
  return {
    // Probably makes sense for `score` to be in `data`, but I'm not sure how to get that value
    // without a hook in the Table that gets all of the scores, which would be annoying because
    // then adjusting any table score would rerender the whole table.
    // We aren't trying to sort by this score or anything yet so we can do that later if we want to.
    data: "",
    render: () => <SolutionTotalCell solution={solution} problem={problem} />,
  };
};

const buildTableCells = (
  problemNode: Node,
  solutions: Node[],
  criteria: Node[],
  edges: Edge[]
): [[HeaderCell, ...HeaderCell[]], ...[HeaderCell, ...Cell[]][]] => {
  const headerRow = [problemNode, ...solutions].map((node) => buildNodeHeader(node)) as [
    HeaderCell,
    ...HeaderCell[]
  ];

  const bodyRows = criteria.map(
    (criterion) =>
      [
        buildNodeHeader(criterion),
        ...solutions.map((solution) => {
          const edge = getConnectingEdge(criterion.id, solution.id, edges);
          if (!edge) {
            throw errorWithData(`No edge found between ${criterion.id} and ${solution.id}`, edges);
          }

          return buildEdgeCell(edge);
        }),
      ] as [HeaderCell, ...Cell[]]
  );

  const totalsRow = [
    buildTotalsHeader(),
    ...solutions.map((solution) => {
      return buildSolutionTotalCell(solution, problemNode);
    }),
  ] as [HeaderCell, ...Cell[]];

  return [headerRow, ...bodyRows, totalsRow];
};

const buildTableDefs = (
  tableData: [[HeaderCell, ...HeaderCell[]], ...[HeaderCell, ...Cell[]][]],
  useSolutionsForColumns: boolean
): { rowData: RowData[]; columnData: MRT_ColumnDef<RowData>[] } => {
  const [headerRow, ...bodyRows] = tableData;

  const rowData: RowData[] = bodyRows.map((row) => {
    const [rowHeader, ...rowCells] = row;

    return {
      rowHeader: rowHeader,
      rowHeaderLabel: rowHeader.label,
      cells: rowCells,
    };
  });

  const columnData: MRT_ColumnDef<RowData>[] = [
    {
      accessorKey: "rowHeaderLabel", // this determines how cols should sort/filter
      header: useSolutionsForColumns ? "criteria" : "solutions",
      Header: headerRow[0].render(),
      enableHiding: false,
      Cell: ({ row }) => row.original.rowHeader.render(),
    },
    ...headerRow.slice(1).map((columnHeader, columnIndex) => {
      return {
        // Don't yet know what we'd want to sort/filter by for edges, so we're setting id instead
        // of accessorKey
        id: columnHeader.id,
        header: columnHeader.label,
        Header: columnHeader.render(),
        enableColumnFilter: false,
        Cell: ({ row }) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- assume that every row has same number of cells as header row
          return row.original.cells[columnIndex]!.render();
        },
      } as MRT_ColumnDef<RowData>;
    }),
  ];

  return { rowData, columnData };
};

interface Props {
  problemNodeId: string;
}

/**
 * Pseudocode:
 * 1. create 2D array `tableData` like (each cell knows how it should render too):
 * [
 *   [problem, solution1, solution2, solution3, ...],
 *   [criterion1, edge11, edge12, edge13, ...],
 *   [criterion2, edge21, edge22, edge23, ...],
 *   [criterion3, edge31, edge32, edge33, ...],
 *   ...
 *   ["totals", edgeX1 * criterion1, edge X2 * criterion2, edge X3 * criterion3, ...]
 * ]
 * 2. transpose the array, if transpose button is clicked
 * 3. table-ify the array:
 *   a. first row turns into headers (`columnData`) that specify filter config and tell cells to render themselves
 *   b. subsequent rows turn into row objects (`rowData`) that know their row header details (for filtering)
 */
export const CriteriaTable = ({ problemNodeId }: Props) => {
  const [useSolutionsForColumns, setUseSolutionsForColumns] = useState<boolean>(true);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const problemNode = useNode(problemNodeId);
  const nodeChildren = useNodeChildren(problemNodeId);
  const edges = useCriterionSolutionEdges(problemNodeId);

  const filterOptions = useFilterOptions("topicDiagram");
  const scores = useDisplayScores(nodeChildren.map((node) => node.id));

  if (!problemNode) return <Loading />;

  const solutions = nodeChildren.filter((child) => child.type === "solution");
  const criteria = nodeChildren.filter((child) => child.type === "criterion");

  const { selectedSolutions, selectedCriteria } =
    filterOptions.type === "tradeoffs"
      ? getSelectedTradeoffNodes(solutions, criteria, filterOptions)
      : { selectedSolutions: solutions, selectedCriteria: criteria };

  const filteredSolutions = applyScoreFilter(selectedSolutions, filterOptions, scores);
  const filteredCriteria = applyScoreFilter(selectedCriteria, filterOptions, scores);

  const tableData = buildTableCells(problemNode, filteredSolutions, filteredCriteria, edges);
  const [headerRow, ..._bodyRows] = tableData;

  const transposedTableData = useSolutionsForColumns
    ? tableData
    : (headerRow.map((_, columnIndex) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- assume that every row has same number of cells as header row
        tableData.map((row) => row[columnIndex]!)
      ) as typeof tableData);

  const { rowData, columnData } = buildTableDefs(transposedTableData, useSolutionsForColumns);

  const ToolBarActions = (table: MRT_TableInstance<RowData>) => {
    return (
      <>
        <MRT_ToggleGlobalFilterButton table={table} />

        {userCanEditTopicData && (
          <>
            <AddNodeButton
              fromPartId={problemNodeId}
              as="child"
              toNodeType="solution"
              relation={{ child: "solution", name: "addresses", parent: "problem" }}
            />

            <AddNodeButton
              fromPartId={problemNodeId}
              as="child"
              toNodeType="criterion"
              relation={{ child: "criterion", name: "criterionFor", parent: "problem" }}
            />
          </>
        )}

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
          // this won't work if the last row's header is just "totals" as a string
          columnPinning: { left: ["rowHeaderLabel"] },
          // columnOrder is defaulted to all cols, but then we'd have to maintain columnOrder when new cols are added
          // defaulting this to empty should be fine until we want column reordering, then I think we'll have to maintain that
          // manually, in order to have new columns included (new columns i.e. from transposing)
          columnOrder: [],
        }}
      />
    </>
  );
};
