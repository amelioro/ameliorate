import { useTheme } from "@emotion/react";
import { Button, ClickAwayListener, Link, Paper, Popper, Typography } from "@mui/material";
import { type Instance } from "@popperjs/core";
import { Position } from "@xyflow/react";
import { groupBy } from "es-toolkit";
import { useEffect, useRef, useState } from "react";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { NodeType, nodeTypes } from "@/common/node";
import { useIsViewportChanging } from "@/web/topic/components/Diagram/viewportChangeStore";
import { edgeColor } from "@/web/topic/components/Edge/Edge.styles";
import { CompressedNode } from "@/web/topic/components/Node/CompressedNode";
import { CustomDataEntry, PieChart } from "@/web/topic/components/Score/PieChart";
import { useHiddenNodes } from "@/web/topic/diagramStore/filteredDiagramStore";
import { useNeighbors } from "@/web/topic/diagramStore/nodeHooks";
import { Node } from "@/web/topic/utils/graph";
import { indicatorLengthRem } from "@/web/topic/utils/nodeDecoration";
import { visibleOnPartHoverSelectedClasses } from "@/web/topic/utils/styleUtils";
import { showNode } from "@/web/view/currentViewStore/filter";
import { setSelected } from "@/web/view/selectedPartStore";
import {
  useEnableContentIndicators,
  useFillNodeAttachmentWithColor,
  useWhenToShowIndicators,
} from "@/web/view/userConfigStore/store";

const HiddenNeighborRow = ({ node }: { node: Node }) => {
  return (
    <div className="flex items-center gap-2">
      <Link
        component="button"
        variant="body2"
        onClick={() => {
          showNode(node.id);
          setSelected(node.id);
        }}
      >
        Reveal
      </Link>
      <CompressedNode node={node} className="grow" />
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
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popperRef = useRef<Instance>(null);

  const whenToShowIndicators = useWhenToShowIndicators();
  const showIndicatorsOnHoverSelect = whenToShowIndicators === "onHoverOrSelect";
  const enableContentIndicators = useEnableContentIndicators();
  const isViewportChanging = useIsViewportChanging();

  const neighbors = useNeighbors(node.id);
  const fillNodeAttachmentWithColor = useFillNodeAttachmentWithColor();
  const hiddenNeighbors = useHiddenNodes(neighbors);

  // Hide the popper visually during panning/zooming so it doesn't detach/lag (also Miro does it
  // this way), then reposition it once panning ends.
  useEffect(() => {
    if (!isViewportChanging) popperRef.current?.forceUpdate();
  }, [isViewportChanging]);

  if (!enableContentIndicators || hiddenNeighbors.length === 0) return null;

  const sortedHiddenNeighbors: Node[] = hiddenNeighbors.toSorted((a, b) => {
    const diff = nodeTypes.indexOf(a.type) - nodeTypes.indexOf(b.type);
    return diff;
  });

  const button = (
    <Button
      ref={buttonRef}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
      className={
        "min-w-0 cursor-pointer rounded-full border-solid p-0 text-text-primary hover:brightness-75" +
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
    <div
      className={
        `pointer-events-auto absolute flex flex-col items-center ${className}` +
        (showIndicatorsOnHoverSelect && !open
          ? ` invisible ${visibleOnPartHoverSelectedClasses}`
          : "")
      }
    >
      {position === Position.Top || position === Position.Left ? (
        <>
          {button}
          {path}
        </>
      ) : (
        <>
          {path}
          {button}
        </>
      )}

      {/* Using this similarly for both node attachment and hidden path panel, but doesn't seem worth extracting to a component yet. Can keep an eye out and extract later if it seems worthwhile */}
      {/* NOTE: might remove this Popper when implementing focused nodes. */}
      {/* Probably will make click focus the node, and right click maybe would show a list of node types to show/hide all... */}
      {/* or a list of nodes by node type, where you could quick-show a node or all the nodes of a type? */}
      <Popper
        open={open}
        anchorEl={buttonRef.current}
        popperRef={popperRef}
        placement="left-start"
        modifiers={[
          { name: "offset", options: { offset: [0, 8] } },
          // try all sides so the panel stays on-screen even when the anchor is near an edge
          { name: "flip", options: { fallbackPlacements: ["right-start", "bottom", "top"] } },
          // make sure the popper doesn't go off-screen
          { name: "preventOverflow", options: { padding: 8 } },
        ]}
        className="z-50"
        style={{ visibility: isViewportChanging ? "hidden" : "visible" }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper elevation={4} className="max-h-[50vh] max-w-xs overflow-auto rounded-xl border">
            <div className="flex flex-col items-center gap-1 p-3">
              <Typography variant="body1" className="font-bold">
                Hidden Neighbors
              </Typography>
              <div className="space-y-2">
                {sortedHiddenNeighbors.map((neighbor) => (
                  <HiddenNeighborRow key={neighbor.id} node={neighbor} />
                ))}
              </div>
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};
