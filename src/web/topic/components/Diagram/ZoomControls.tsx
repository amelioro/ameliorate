import { Add, FitScreen, Remove } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useReactFlow, useStore } from "@xyflow/react";

import { hotkeys } from "@/web/topic/utils/hotkeys";

/**
 * Same functionality as React Flow's built-in `Controls`, but using our own buttons so that they
 * match our other button styles (e.g. `NodeToolbar`).
 */
export const ZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const maxZoomReached = useStore((state) => state.transform[2] >= state.maxZoom);

  return (
    <div className="flex flex-col rounded-sm border bg-paperShaded-main shadow-sm">
      <IconButton
        title={`Zoom in (${hotkeys.zoomIn})`}
        aria-label={`Zoom in (${hotkeys.zoomIn})`}
        size="small"
        onClick={() => void zoomIn()}
        disabled={maxZoomReached}
        className="rounded-sm"
      >
        <Add fontSize="inherit" />
      </IconButton>

      <IconButton
        title={`Zoom out (${hotkeys.zoomOut})`}
        aria-label={`Zoom out (${hotkeys.zoomOut})`}
        size="small"
        onClick={() => void zoomOut()}
        className="rounded-sm"
      >
        <Remove fontSize="inherit" />
      </IconButton>

      <IconButton
        title="Fit view"
        aria-label="Fit view"
        size="small"
        onClick={() => void fitView({ maxZoom: 1 })} // match initial fit view so that small diagrams aren't zoomed in a bunch
        className="rounded-sm"
      >
        <FitScreen fontSize="inherit" />
      </IconButton>
    </div>
  );
};
