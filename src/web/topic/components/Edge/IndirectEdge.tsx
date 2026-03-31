import { ClickAwayListener, Link, Paper, Popper, Typography } from "@mui/material";
import { type Instance } from "@popperjs/core";
import { lowerCase } from "es-toolkit";
import { useEffect, useRef, useState } from "react";

import { type CalculatedEdge } from "@/common/edge";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { useIsViewportChanging } from "@/web/topic/components/Diagram/viewportChangeStore";
import { Edge } from "@/web/topic/components/Edge/Edge";
import { HiddenPathPanel } from "@/web/topic/components/Edge/HiddenPathPanel";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { type IndirectEdge as IndirectEdgeData } from "@/web/topic/utils/indirectEdges";
import { visibleOnPartHoverSelectedClasses } from "@/web/topic/utils/styleUtils";
import { useWhenToShowIndicators } from "@/web/view/userConfigStore/store";

interface Props {
  edge: IndirectEdgeData;
  edgeLayoutData: EdgeLayoutData;
  inReactFlow: boolean;
}

export const IndirectEdge = ({ edge, edgeLayoutData, inReactFlow }: Props) => {
  const labelText = lowerCase(edge.type);

  const labelContentSlot = (
    <>
      <Typography
        variant="body1"
        margin="0"
        className={
          /**
           * - `bg-white`: ensures our label has a background so that paths don't go _through_ the
           * label. note: putting this on the label container itself makes the background bigger
           * than it needs to be, overlapping other labels/paths more often.
           * - `leading-none`: ensures the background is as tight as possible to the text so that it
           * doesn't overlap other labels/paths often. should be ok because edge labels are on a
           * single line, so vertical spacing between other lines isn't relevant.
           */
          "bg-white leading-none"
        }
      >
        {labelText}
      </Typography>
      {inReactFlow && <HiddenNodesAnchor indirectEdge={edge} />}
    </>
  );

  return (
    <Edge
      edge={edge}
      edgeLayoutData={edgeLayoutData}
      labelContentSlot={labelContentSlot}
      onContextMenu={(event) => openContextMenu(event, { calculatedEdge: edge })}
      inReactFlow={inReactFlow}
      pathClassName="[stroke-dasharray:5,5]"
    />
  );
};

/**
 * Displays "X nodes hidden" and opens the hidden path panel.
 */
const HiddenNodesAnchor = ({ indirectEdge }: { indirectEdge: CalculatedEdge }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popperRef = useRef<Instance>(null);

  const whenToShowIndicators = useWhenToShowIndicators();
  const showOnHoverSelect = whenToShowIndicators === "onHoverOrSelect";
  const isViewportChanging = useIsViewportChanging();

  // Hide the popper visually during panning/zooming so it doesn't detach/lag (also Miro does it
  // this way), then reposition it once panning ends.
  useEffect(() => {
    if (!isViewportChanging) popperRef.current?.forceUpdate();
  }, [isViewportChanging]);

  // Each hidden edge contributes one hidden node except the last one,
  // since the indirect edge's source and target are displaying.
  const hiddenCount = indirectEdge.data.hiddenPath.length - 1;
  if (hiddenCount <= 0) return null;

  return (
    <>
      {/* hover bridge so we can add a gap between the link and the label, and mouse can hover between them */}
      <div className="absolute bottom-0 h-2 w-full translate-y-full" />

      <Link
        ref={anchorRef}
        component="button"
        variant="body2"
        color="textSecondary"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={
          // nowrap because otherwise our text can be smaller than the parent label's text, in which case it would wrap
          "absolute bottom-0 translate-y-[calc(100%+4px)] whitespace-nowrap rounded-full border bg-white px-2 py-0.5 text-sm" +
          (showOnHoverSelect && !open ? ` invisible ${visibleOnPartHoverSelectedClasses}` : "")
        }
      >
        {hiddenCount} {hiddenCount === 1 ? "node" : "nodes"} hidden
      </Link>

      {/* Using this similarly for both node attachment and hidden path panel, but doesn't seem worth extracting to a component yet. Can keep an eye out and extract later if it seems worthwhile */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        popperRef={popperRef}
        placement="right-start"
        modifiers={[
          { name: "offset", options: { offset: [0, 8] } },
          // try all sides so the panel stays on-screen even when the anchor is near an edge
          { name: "flip", options: { fallbackPlacements: ["left-start", "bottom", "top"] } },
          // make sure the popper doesn't go off-screen
          { name: "preventOverflow", options: { padding: 8 } },
        ]}
        // z-index high enough to be above edges but below dialogs
        className="z-50"
        // set visibility instead of unmounting via `open` so that ClickAwayListener stays mounted and can register clicks to close the panel
        style={{ visibility: isViewportChanging ? "hidden" : "visible" }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper elevation={4} className="max-w-xs overflow-hidden rounded-xl border">
            {/* extra div so that scrollbar can be cut off via `overflow-hidden` and therefore rounded */}
            <div className="max-h-[50vh] overflow-auto">
              <HiddenPathPanel indirectEdge={indirectEdge} />
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
