import { useLayoutEffect, useMemo, useState } from "react";

import {
  type Spotlight,
  primarySpotlightColor,
  secondarySpotlightColor,
} from "@/web/topic/components/Diagram/Diagram.styles";
import { edgeColor } from "@/web/topic/components/Edge/Edge.styles";

/**
 * Arrow type that determines the shape rendered on the edge.
 *
 * Logic gates give us a way to convey roughly our edge types via symbol. See here for what they look like https://techterms.com/img/xl/logic_gate_375.png
 * Right now we just use one, but we plan to use more later.
 *
 * - "bufferGate": Simple triangle (▷)
 */
type ArrowType = "bufferGate";

const spotlightToEdgeColor: Record<Spotlight, string> = {
  primary: primarySpotlightColor,
  secondary: secondarySpotlightColor,
  normal: edgeColor,
  background: edgeColor,
};

interface EdgeArrowProps {
  labelContainer: HTMLDivElement | null;
  pathDefinition: string;
  spotlight: Spotlight;
}

export const EdgeArrow = ({ labelContainer, pathDefinition, spotlight }: EdgeArrowProps) => {
  const [labelSize, setLabelSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!labelContainer) return;
    const { offsetWidth, offsetHeight } = labelContainer;
    if (labelSize?.width === offsetWidth && labelSize.height === offsetHeight) return;

    setLabelSize({ width: offsetWidth, height: offsetHeight });
  }, [labelContainer, labelSize]);

  const arrowPosition = useMemo(() => {
    if (!labelSize) return null;

    // 12px padding is somewhat arbitrary that looks good for both edge details pane header (which
    // is a short path) and for longer/angled paths that can show up in a diagram.
    return getArrowTransformAtLabelBorder(pathDefinition, labelSize.width, labelSize.height, 12);
  }, [pathDefinition, labelSize]);

  if (!arrowPosition) return null;

  const shape = arrowShapePaths.bufferGate;
  const color = spotlightToEdgeColor[spotlight];

  return (
    <g
      className={`react-flow__edge-arrow spotlight-${spotlight}`}
      transform={`translate(${arrowPosition.x}, ${arrowPosition.y}) rotate(${arrowPosition.angle}) scale(1.25, 1.125)`}
    >
      <path d={shape.path} fill="white" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </g>
  );
};

/**
 * Returns the angle (in degrees) of the path at a given length fraction (0–1).
 *
 * Uses `getPointAtLength` to sample two nearby points and compute the tangent angle.
 * See https://stackoverflow.com/a/32793413/8409296
 */
const getAngleAtFraction = (pathElement: SVGPathElement, fraction: number): number => {
  const totalLength = pathElement.getTotalLength();
  const targetLength = totalLength * fraction;

  // Sample two points a small distance apart to compute the tangent
  const delta = 0.5;
  const p1 = pathElement.getPointAtLength(Math.max(0, targetLength - delta));
  const p2 = pathElement.getPointAtLength(Math.min(totalLength, targetLength + delta));

  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
};

/**
 * Returns the arrow's position and angle, placed on the path where path exits the edge label's
 * border, with optional padding.
 *
 * Logic here was mostly written by LLM, but it seems good. There are some visuals here that may help https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection.html
 * And benchmarked to take ~174ms for 500 edges on mid-tier mobile, which seems good enough https://github.com/amelioro/ameliorate/issues/785#issuecomment-4101140950
 *
 * Uses the path's tangent at the midpoint to cast a ray from the label center outward,
 * then analytically computes where that ray intersects the label's bounding rectangle
 * (ray-AABB intersection). The resulting straight-line distance is used as a path-length
 * offset from the midpoint, and `getPointAtLength` snaps it back onto the actual curve.
 */
const getArrowTransformAtLabelBorder = (
  pathDefinition: string,
  labelWidthPx: number,
  labelHeightPx: number,
  paddingPx: number,
): { x: number; y: number; angle: number } => {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", pathDefinition);

  const totalLength = pathElement.getTotalLength();
  const midLength = totalLength / 2;

  // Get path direction at the midpoint (toward the target).
  const midAngle = getAngleAtFraction(pathElement, 0.5);
  const radians = (midAngle * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);

  // Ray-AABB intersection to estimate straight-line distance from label center to border.
  // tx/ty are how far the ray must travel to reach the left/right vs top/bottom wall.
  // One of tx or ty will always be finite (the ray can't be perpendicular to both axes),
  // so straightDist is always a usable finite number.
  const hw = labelWidthPx / 2 + paddingPx;
  const hh = labelHeightPx / 2 + paddingPx;
  const tx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const straightDist = Math.min(tx, ty);

  // Use that distance as a path-length offset, clamped to the path bounds.
  const targetLength = Math.min(midLength + straightDist, totalLength);
  const point = pathElement.getPointAtLength(targetLength);
  const fraction = targetLength / totalLength;
  const angle = getAngleAtFraction(pathElement, fraction);

  return { x: point.x, y: point.y, angle };
};

const arrowSizePx = 10;

/**
 * SVG path data for each arrow shape, drawn centered at origin pointing right (→).
 * The arrow will be rotated to follow the edge path direction.
 */
const arrowShapePaths: Record<ArrowType, { path: string }> = {
  // Simple triangle: ▷
  bufferGate: {
    path: `M ${-arrowSizePx / 2} ${-arrowSizePx / 2} L ${arrowSizePx / 2} 0 L ${-arrowSizePx / 2} ${arrowSizePx / 2} Z`,
  },
};
