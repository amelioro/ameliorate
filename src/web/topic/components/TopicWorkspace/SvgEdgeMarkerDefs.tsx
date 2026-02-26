import {
  Spotlight,
  primarySpotlightColor,
  secondarySpotlightColor,
} from "@/web/topic/components/Diagram/Diagram.styles";
import { edgeColor } from "@/web/topic/components/Edge/ScoreEdge.styles";

// mostly copied from react-flow's marker html - jank but the package doesn't export its marker definition
// https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/react/src/container/EdgeRenderer/MarkerDefinitions.tsx#L29-L41
const getEdgeMarkerDef = (id: string, color: string) => {
  return (
    <marker
      key={id}
      id={id}
      markerWidth="30"
      markerHeight="30"
      viewBox="-10 -10 20 20"
      // changed from `strokeWidth` so that stroke can increase edge width without affecting arrow size
      markerUnits="userSpaceOnUse"
      orient="auto"
      refX="0"
      refY="0"
    >
      <polyline
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        fill={color}
        points="-5,-4 0,0 -5,4 -5,-4"
      />
    </marker>
  );
};

export const markerIds: Record<Spotlight, string> = {
  primary: "marker-primary",
  secondary: "marker-secondary",
  normal: "marker-normal",
  background: "marker-background",
};

export const SvgEdgeMarkerDefs = () => {
  return (
    <svg className="absolute h-0 w-0">
      <defs>
        {getEdgeMarkerDef(markerIds.primary, primarySpotlightColor)}
        {getEdgeMarkerDef(markerIds.secondary, secondarySpotlightColor)}
        {getEdgeMarkerDef(markerIds.normal, edgeColor)}
        {getEdgeMarkerDef(markerIds.background, edgeColor)}
      </defs>
    </svg>
  );
};
