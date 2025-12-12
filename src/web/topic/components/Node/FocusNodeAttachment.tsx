import { useTheme } from "@emotion/react";
import { Visibility } from "@mui/icons-material";
import { Button, IconButton, Typography } from "@mui/material";
import { Position } from "@xyflow/react";
import { groupBy } from "es-toolkit";
import { ReactNode } from "react";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { NodeType, nodeTypes, prettyNodeTypes } from "@/common/node";
import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { edgeColor } from "@/web/topic/components/Edge/ScoreEdge.styles";
import { CustomDataEntry, PieChart } from "@/web/topic/components/Score/PieChart";
import { useNeighbors } from "@/web/topic/diagramStore/nodeHooks";
import { useHiddenNodes } from "@/web/topic/hooks/flowHooks";
import { Node } from "@/web/topic/utils/graph";
import { indicatorLengthRem, nodeDecorations } from "@/web/topic/utils/nodeDecoration";
import { showNode } from "@/web/view/currentViewStore/filter";
import { useFillNodeAttachmentWithColor } from "@/web/view/userConfigStore";

const NodeSummary = ({ node, beforeSlot }: { node: Node; beforeSlot?: ReactNode }) => {
  const { NodeIcon } = nodeDecorations[node.type];
  const title = prettyNodeTypes[node.type];

  const summary = `${title}: ${node.data.label}`;

  return (
    <div className="flex items-center text-nowrap">
      {beforeSlot}
      <NodeIcon color={node.type} sx={{ marginX: "2px" }} />
      {/* title set so that hover can show the full text if truncated */}
      <Typography title={summary} variant="body1" className="items-center truncate">
        {summary}
      </Typography>
    </div>
  );
};

interface NeighborsPieProps {
  neighbors: Node[];
}

const NeighborsPie = ({ neighbors }: NeighborsPieProps) => {
  const theme = useTheme();

  const neighborsByType = groupBy(neighbors, (node) => node.type);

  const data: Data<CustomDataEntry> = Object.entries(neighborsByType).map(([type, nodes]) => {
    const paletteColor = theme.palette[type as NodeType];
    return {
      value: nodes.length,
      color: paletteColor.main,
      hoverColor: paletteColor.dark,
      key: type,
    };
  });

  return <PieChart customData={data} type="button" startAngle={-90} interactive={false} />;
};

interface FocusNodeAttachmentProps {
  node: Node;
  position: Position;
  className?: string;
}

export const FocusNodeAttachment = ({ node, position, className }: FocusNodeAttachmentProps) => {
  const neighbors = useNeighbors(node.id);
  const fillNodeAttachmentWithColor = useFillNodeAttachmentWithColor();
  // TODO(bug): if new neighbor is added and there are currently no hidden neighbors,
  // `useNeighbors` will trigger a re-render at the same time as Diagram re-renders,
  // so the `hiddenNeighbors` will not yet know that the new neighbor is displayed... then the Diagram
  // will finish rendering and `hiddenNeighbors` will trigger a re-render.
  // The result is that adding a new neighbor will make the handle flicker to indicate that there's
  // a hidden neighbor for just a moment, before rendering without indicating a hidden neighbor.
  // Instead of relying on what react flow is displaying, we should probably just re-use the
  // `useDiagram` hook to know what is currently being shown (definitely would want it cached if it'll
  // but used on every node's attachment render).
  const hiddenNeighbors = useHiddenNodes(neighbors);

  if (hiddenNeighbors.length === 0) return null;

  const sortedHiddenNeighbors: Node[] = hiddenNeighbors.toSorted((a, b) => {
    const diff = nodeTypes.indexOf(a.type) - nodeTypes.indexOf(b.type);
    return diff;
  });

  const buttonWithTooltip = (
    // NOTE: planning to remove this tooltip when implementing focused nodes.
    // Probably will make click focus the node, and right click maybe would show a list of node types to show/hide all...
    // or a list of nodes by node type, where you could quick-show a node or all the nodes of a type?
    // Bug?: seems like on mobile sometimes when a neighbor is hidden, this tooltip just starts showing
    // without tapping. seems to happen inconsistently. seems maybe related to what is focused when
    // the neighbor is hidden?
    <Tooltip
      tooltipBody={
        <div className="space-y-2">
          {sortedHiddenNeighbors.map((neighbor) => (
            <NodeSummary
              key={neighbor.id}
              node={neighbor}
              beforeSlot={
                <IconButton className="p-0" onClick={() => showNode(neighbor.id)}>
                  {<Visibility />}
                </IconButton>
              }
            />
          ))}
        </div>
      }
    >
      <Button
        className={
          "min-w-0 cursor-auto rounded-full border-solid p-0 text-text-primary" +
          (fillNodeAttachmentWithColor ? "" : " border bg-paperPlain-main")
        }
        sx={{
          height: `${indicatorLengthRem}rem`,
          width: `${indicatorLengthRem}rem`,
          borderColor: edgeColor,
        }}
      >
        {fillNodeAttachmentWithColor && (
          <div
            // Behind the button so the score shows in front of the pie.
            // No pointer events because our button will handle clicks/hovers.
            // Overflow hidden because pie chart type "button" renders a larger pie in case you want a
            // square pie e.g. like the score button does.
            className="absolute z-[-1] size-full overflow-hidden rounded-full *:pointer-events-none"
          >
            <NeighborsPie neighbors={hiddenNeighbors} />
          </div>
        )}
        {hiddenNeighbors.length}
      </Button>
    </Tooltip>
  );

  const verticalDirection = [Position.Top, Position.Bottom].includes(position);

  const path = verticalDirection ? (
    // width 2 and x = 1 to center the line
    <svg width="2" height="8">
      <line x1="1" y1="0" x2="1" y2="8" strokeWidth="1" stroke={edgeColor} />
    </svg>
  ) : (
    <svg width="8" height="2">
      <line x1="0" y1="1" x2="8" y2="1" strokeWidth="1" stroke={edgeColor} />
    </svg>
  );

  return (
    <div className={`pointer-events-auto absolute flex flex-col items-center ${className}`}>
      {position === Position.Top || position === Position.Left ? (
        <>
          {buttonWithTooltip}
          {path}
        </>
      ) : (
        <>
          {path}
          {buttonWithTooltip}
        </>
      )}
    </div>
  );
};
