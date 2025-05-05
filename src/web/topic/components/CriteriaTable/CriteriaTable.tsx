import { Global } from "@emotion/react";
import { PivotTableChart } from "@mui/icons-material";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import {
  type MRT_ColumnDef,
  type MRT_TableInstance,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
} from "material-react-table";
import React from "react";

import { errorWithData } from "@/common/errorHandling";
import { useSessionUser } from "@/web/common/hooks";
import { tableStyles } from "@/web/topic/components/CriteriaTable/CriteriaTable.styles";
import { EdgeCell } from "@/web/topic/components/CriteriaTable/EdgeCell";
import { NodeCell } from "@/web/topic/components/CriteriaTable/NodeCell";
import { SolutionTotalCell } from "@/web/topic/components/CriteriaTable/SolutionTotalCell";
import { TotalsHeaderCell } from "@/web/topic/components/CriteriaTable/TotalsHeaderCell";
import { tableZoomClasses } from "@/web/topic/components/CriteriaTable/tableZoom";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import {
  useCriterionSolutionEdges,
  useDefaultNode,
  useNodeChildren,
} from "@/web/topic/store/nodeHooks";
import { useDisplayScores } from "@/web/topic/store/scoreHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { getConnectingEdge } from "@/web/topic/utils/edge";
import { Edge, Node } from "@/web/topic/utils/graph";
import { useGeneralFilter, useTableFilter } from "@/web/view/currentViewStore/filter";
import { setTransposed, useTransposed } from "@/web/view/currentViewStore/store";
import { applyScoreFilter } from "@/web/view/utils/generalFilter";
import { getSelectedTradeoffNodes } from "@/web/view/utils/infoFilter";

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
  edges: Edge[],
): [[HeaderCell, ...HeaderCell[]], ...[HeaderCell, ...Cell[]][]] => {
  const headerRow = [problemNode, ...solutions].map((node) => buildNodeHeader(node)) as [
    HeaderCell,
    ...HeaderCell[],
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
      ] as [HeaderCell, ...Cell[]],
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
  useSolutionsForColumns: boolean,
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
export const CriteriaTable = () => {
  const transposed = useTransposed();

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const tableFilter = useTableFilter();
  const generalFilter = useGeneralFilter();

  // if no problem is selected, show the criteria table for a fallback problem
  const problemNode = useDefaultNode("problem", tableFilter.centralProblemId);
  const nodeChildren = useNodeChildren(problemNode?.id);
  const edges = useCriterionSolutionEdges(problemNode?.id);
  const scores = useDisplayScores(nodeChildren.map((node) => node.id));

  if (!problemNode)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography>Select a central problem node to view the tradeoff table</Typography>
      </Box>
    );

  const solutions = nodeChildren.filter((child) => child.type === "solution");
  const criteria = nodeChildren.filter((child) => child.type === "criterion");

  const { selectedSolutions, selectedCriteria } = getSelectedTradeoffNodes(
    solutions,
    criteria,
    tableFilter,
  );

  const filteredSolutions = applyScoreFilter(selectedSolutions, generalFilter, scores).filter(
    (node) => !generalFilter.nodesToHide.includes(node.id),
  );
  const filteredCriteria = applyScoreFilter(selectedCriteria, generalFilter, scores).filter(
    (node) => !generalFilter.nodesToHide.includes(node.id),
  );

  const tableData = buildTableCells(problemNode, filteredSolutions, filteredCriteria, edges);
  const [headerRow, ..._bodyRows] = tableData;

  const transposedTableData = transposed
    ? tableData
    : (headerRow.map((_, columnIndex) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- assume that every row has same number of cells as header row
        tableData.map((row) => row[columnIndex]!),
      ) as typeof tableData);

  const { rowData, columnData } = buildTableDefs(transposedTableData, transposed);

  const ToolBarActions = (table: MRT_TableInstance<RowData>) => {
    return (
      <div className="pr-12">
        <MRT_ToggleGlobalFilterButton table={table} />

        {userCanEditTopicData && (
          <>
            <AddNodeButton
              fromPartId={problemNode.id}
              as="child"
              toNodeType="solution"
              relation={{ child: "solution", name: "addresses", parent: "problem" }}
            />

            <AddNodeButton
              fromPartId={problemNode.id}
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
            onClick={() => setTransposed(!transposed)}
          >
            <PivotTableChart />
          </Button>
        </Tooltip>

        <MRT_ToggleFullScreenButton table={table} />
      </div>
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
        muiTableProps={{
          className: tableZoomClasses,
        }}
        muiTablePaperProps={{
          // no shadow because that creates lines that don't line up well with the app header
          className: "criteria-table-paper shadow-none",
        }}
        muiTableBodyRowProps={{ hover: false }}
        state={{
          // have to set columnOrder because otherwise new columns are appended to the end, instead of before the last cell in the case of Solution Totals when table is transposed
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- all columns should have an id or accessorKey set
          columnOrder: columnData.map((col) => col.id ?? col.accessorKey!),
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
