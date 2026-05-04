import { useLayoutEffect, useMemo, useState } from "react";

import { type AnyRelationName, type CausalType, causalTypes } from "@/common/edge";
import {
  type Spotlight,
  primarySpotlightColor,
  secondarySpotlightColor,
} from "@/web/topic/components/Diagram/Diagram.styles";
import { edgeColor } from "@/web/topic/components/Edge/Edge.styles";
import { useEnableSemanticArrowShapes } from "@/web/view/userConfigStore/store";

/**
 * Arrow type that determines the shape rendered on the edge.
 *
 * Logic gates give us a way to convey roughly our edge types via symbol. See here for what they look like https://techterms.com/img/xl/logic_gate_375.png
 *
 * - "bufferGate": Simple triangle (▷) - for "causes" / "supports"
 * - "andGate": D-shape (flat left, curved right) - for "has"
 * - "notGate": Triangle with small circle at tip - for "reduces" / "critiques"
 * - "orGate": Curved shield shape - for "misc" / "none"
 */
type ArrowType = "bufferGate" | "andGate" | "notGate" | "orGate";

const causalTypeToArrowType: Record<CausalType, ArrowType> = {
  causes: "bufferGate",
  supports: "bufferGate",
  has: "andGate",
  reduces: "notGate",
  critiques: "notGate",
  misc: "orGate",
  none: "orGate",
};

const spotlightToEdgeColor: Record<Spotlight, string> = {
  primary: primarySpotlightColor,
  secondary: secondarySpotlightColor,
  normal: edgeColor,
  background: edgeColor,
};

interface EdgeArrowProps {
  edgeType: AnyRelationName;
  labelContainer: HTMLDivElement | null;
  labelX: number;
  labelY: number;
  pathDefinition: string;
  spotlight: Spotlight;
}

export const EdgeArrow = ({
  edgeType,
  labelContainer,
  labelX,
  labelY,
  pathDefinition,
  spotlight,
}: EdgeArrowProps) => {
  const [labelSize, setLabelSize] = useState<{ width: number; height: number } | null>(null);

  const enableSemanticArrowShapes = useEnableSemanticArrowShapes();

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
    return getArrowTransformAtLabelBorder(
      pathDefinition,
      labelX,
      labelY,
      labelSize.width,
      labelSize.height,
      12,
    );
  }, [pathDefinition, labelX, labelY, labelSize]);

  if (!arrowPosition) return null;

  const arrowType = enableSemanticArrowShapes ? getArrowTypeForEdge(edgeType) : "bufferGate";
  const shape = arrowShapePaths[arrowType];
  const color = spotlightToEdgeColor[spotlight];

  return (
    <g
      className={`react-flow__edge-arrow spotlight-${spotlight}`}
      transform={`translate(${arrowPosition.x}, ${arrowPosition.y}) rotate(${arrowPosition.angle}) scale(1.25, 1.125)`}
    >
      <path d={shape.path} fill="white" stroke={color} strokeWidth="1" strokeLinejoin="round" />
      {shape.circle && (
        <circle
          cx={shape.circle.cx}
          cy={shape.circle.cy}
          r={shape.circle.r}
          fill="white"
          stroke={color}
          strokeWidth="1"
        />
      )}
    </g>
  );
};

const getArrowTypeForEdge = (edgeType: AnyRelationName): ArrowType => {
  return causalTypeToArrowType[causalTypes[edgeType]];
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
 *
 * Benchmarks on mid-tier mobile are ~350ms for 500 edges with avoidEdgeLabelOverlap off, and
 * ~1100ms for 500 edges with avoidEdgeLabelOverlap on, see https://github.com/amelioro/ameliorate/issues/785#issuecomment-4372143620.
 * I think we should expect ~100 edges at most, at around ~200ms this seems like logic that can be
 * potentially improved but seems ok for now. In any case, we're at a stage where functionality is
 * more important than performance, as long as performance doesn't make the app unusable.
 *
 * --
 *
 * Uses the path's tangent at the label position to cast a ray from the label center outward,
 * then analytically computes where that ray intersects the label's bounding rectangle
 * (ray-AABB intersection). The resulting straight-line distance is used as a path-length
 * offset from the label position, and `getPointAtLength` snaps it back onto the actual curve.
 *
 * The label position is assumed to be at the path midpoint — which is true when
 * `avoidEdgeLabelOverlap` is off (we build the path symmetrically around the label). When it's
 * on and ELK has placed the label elsewhere along the path, we fall back to a bracker-halving
 * search to locate the closest path point. The fast path covers the common case for free.
 */
const getArrowTransformAtLabelBorder = (
  pathDefinition: string,
  labelX: number,
  labelY: number,
  labelWidthPx: number,
  labelHeightPx: number,
  paddingPx: number,
): { x: number; y: number; angle: number } => {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", pathDefinition);

  const totalLength = pathElement.getTotalLength();
  if (totalLength === 0) throw new Error("Edge path has zero length, cannot position arrow"); // this should never happen, but we're being explicit because we divide by this value below
  const lengthToLabel = getLengthToLabel(pathElement, totalLength, labelX, labelY);

  // Get path direction at the label position (toward the target).
  const angleAtLabel = getAngleAtFraction(pathElement, lengthToLabel / totalLength);
  const radians = (angleAtLabel * Math.PI) / 180;
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
  const targetLength = Math.min(lengthToLabel + straightDist, totalLength);
  const point = pathElement.getPointAtLength(targetLength);
  const fraction = targetLength / totalLength;
  const angle = getAngleAtFraction(pathElement, fraction);

  return { x: point.x, y: point.y, angle };
};

/**
 * Returns the path-length up to the point where the label is located on the path.
 *
 * Logic here mostly written by LLM to quick-fix an issue with arrows displaying when avoiding edge
 * label overlap is on. But it seems reasonable, and performance doesn't seem terribly bad (see comment
 * on getArrowTransformAtLabelBorder above).
 *
 * Fast path: when the label is at (or very near) the path midpoint, return `totalLength / 2`
 * directly. This covers the `avoidEdgeLabelOverlap`-off case — paths are built so that the label
 * sits at the parametric midpoint of a (near-)symmetric quartic, which is also the arclength
 * midpoint within rounding.
 *
 * Slow path: when the label has been positioned by ELK along a bend-pointed path, bisect to the
 * closest point. Each iteration probes at the bracket's inner quartiles and discards the half not
 * containing the minimum. Assumes distance-to-label is unimodal along the path — true for the
 * smooth, mostly-monotonic routes we generate.
 */
const getLengthToLabel = (
  pathElement: SVGPathElement,
  totalLength: number,
  labelX: number,
  labelY: number,
): number => {
  const distSqFrom = (length: number) => {
    const point = pathElement.getPointAtLength(length);
    const dx = point.x - labelX;
    const dy = point.y - labelY;
    return dx * dx + dy * dy;
  };

  // 4px² ≈ 2px tolerance — plenty of slack for bezier vs. arclength midpoint differences without
  // false-matching ELK positions, which are typically tens of pixels off the path midpoint.
  const midDistSq = distSqFrom(totalLength / 2);
  if (midDistSq < 4) return totalLength / 2;

  // Bracket halves each iteration. 8 iterations → ~0.4% of total length, well past the precision
  // the tangent calc needs.
  const { low, high } = Array.from({ length: 8 }).reduce<{ low: number; high: number }>(
    (bracket) => {
      const mid = (bracket.low + bracket.high) / 2;
      const quarter = (bracket.high - bracket.low) / 4;
      return distSqFrom(mid - quarter) < distSqFrom(mid + quarter)
        ? { low: bracket.low, high: mid }
        : { low: mid, high: bracket.high };
    },
    { low: 0, high: totalLength },
  );
  return (low + high) / 2;
};

const arrowSizePx = 10;

/**
 * SVG path data for each arrow shape, drawn centered at origin pointing right (→).
 * The arrow will be rotated to follow the edge path direction.
 */
const arrowShapePaths: Record<
  ArrowType,
  { path: string; circle?: { cx: number; cy: number; r: number } }
> = {
  // Simple triangle: ▷
  bufferGate: {
    path: `M ${-arrowSizePx / 2} ${-arrowSizePx / 2} L ${arrowSizePx / 2} 0 L ${-arrowSizePx / 2} ${arrowSizePx / 2} Z`,
  },
  // D-shape (AND gate): flat left side, curved right side
  andGate: {
    path:
      `M ${-arrowSizePx / 2} ${-arrowSizePx / 2} L ${-arrowSizePx / 2} ${arrowSizePx / 2} ` +
      `Q ${arrowSizePx / 2 + 2} ${arrowSizePx / 2}, ${arrowSizePx / 2 + 2} 0 ` +
      `Q ${arrowSizePx / 2 + 2} ${-arrowSizePx / 2}, ${-arrowSizePx / 2} ${-arrowSizePx / 2} Z`,
  },
  // NOT gate: triangle with small circle at the tip
  notGate: {
    path: `M ${-arrowSizePx / 2} ${-arrowSizePx / 2} L ${arrowSizePx / 2 - 2} 0 L ${-arrowSizePx / 2} ${arrowSizePx / 2} Z`,
    circle: { cx: arrowSizePx / 2 + 1, cy: 0, r: 2.5 },
  },
  // OR gate: curved shield shape
  orGate: {
    path:
      `M ${-arrowSizePx / 2} ${-arrowSizePx / 2} ` +
      `Q ${-arrowSizePx / 6} ${-arrowSizePx / 4}, ${-arrowSizePx / 6} 0 ` +
      `Q ${-arrowSizePx / 6} ${arrowSizePx / 4}, ${-arrowSizePx / 2} ${arrowSizePx / 2} ` +
      `Q ${arrowSizePx / 4} ${arrowSizePx / 3}, ${arrowSizePx / 2 + 2} 0 ` +
      `Q ${arrowSizePx / 4} ${-arrowSizePx / 3}, ${-arrowSizePx / 2} ${-arrowSizePx / 2} Z`,
  },
};
