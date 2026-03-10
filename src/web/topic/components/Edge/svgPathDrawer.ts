import { throwError } from "@/common/errorHandling";
import { scalePxViaDefaultFontSize } from "@/pages/_document.page";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { labelWidthPx } from "@/web/topic/utils/layout";

interface Point {
  x: number;
  y: number;
}

/**
 * Roughly scales the offset spacing between each parallel edge.
 *
 * E.g. two parallel edges with indices -1 and 1 will be offset by a bit less this value in px to
 * the left and right.
 *
 * This value is the amount in px to shift one control point of the bezier curve, creating the
 * offset. Technically the curve will only be pulled _towards_ the control point, so the curve will
 * be offset by a bit less than this value in px.
 */
const parallelOffsetSpacing = 80;

/**
 * Sorry this is LLM magic. It seems to work. The comments seem legit.
 *
 * Converts a degree-4 (quartic) Bézier defined by 5 control points into an SVG path string
 * composed of two cubic Bézier segments joined at the quartic's midpoint (t=0.5).
 *
 * The two cubics are computed to match the quartic's position and tangent at t=0, t=0.5, and t=1,
 * giving C1 continuity at the junction. This is a very close approximation — visually
 * indistinguishable from a true quartic.
 *
 * Math: given quartic control points P0..P4, the midpoint is:
 *   M = (P0 + 4*P1 + 6*P2 + 4*P3 + P4) / 16
 *
 * First cubic:  Q0=P0, Q1=(P0+2*P1)/3, Q2=M+(P0+2*P1-2*P3-P4)/12, Q3=M
 * Second cubic: R0=M,  R1=M-(P0+2*P1-2*P3-P4)/12, R2=(2*P3+P4)/3, R3=P4
 */
const quarticToSvgPath = (p0: Point, p1: Point, p2: Point, p3: Point, p4: Point) => {
  // Quartic Bézier evaluated at t=0.5
  const m = {
    x: (p0.x + 4 * p1.x + 6 * p2.x + 4 * p3.x + p4.x) / 16,
    y: (p0.y + 4 * p1.y + 6 * p2.y + 4 * p3.y + p4.y) / 16,
  };

  // Reused term: (P0 + 2*P1 - 2*P3 - P4) / 12
  const tangentAdj = {
    x: (p0.x + 2 * p1.x - 2 * p3.x - p4.x) / 12,
    y: (p0.y + 2 * p1.y - 2 * p3.y - p4.y) / 12,
  };

  // First cubic: P0 → M
  const q1 = { x: (p0.x + 2 * p1.x) / 3, y: (p0.y + 2 * p1.y) / 3 };
  const q2 = { x: m.x + tangentAdj.x, y: m.y + tangentAdj.y };

  // Second cubic: M → P4  (R1 = 2*M - Q2, giving C1 continuity)
  const r1 = { x: m.x - tangentAdj.x, y: m.y - tangentAdj.y };
  const r2 = { x: (2 * p3.x + p4.x) / 3, y: (2 * p3.y + p4.y) / 3 };

  const pathDefinition = [
    `M ${p0.x} ${p0.y}`,
    `C ${q1.x} ${q1.y}, ${q2.x} ${q2.y}, ${m.x} ${m.y}`,
    `C ${r1.x} ${r1.y}, ${r2.x} ${r2.y}, ${p4.x} ${p4.y}`,
  ].join(" ");

  return { pathDefinition, labelX: m.x, labelY: m.y };
};

/**
 * Draws a bezier path between start and end, optionally offset for parallel edges.
 *
 * See this image for a visualization: https://github.com/user-attachments/assets/1c40ff8f-2e7f-46f1-a0e8-4a525e678510
 * See this topic for what the rendering currently looks like with a few different offsets: https://ameliorate.app/keyserj/test-some-nodes
 *
 * The curve is defined as a degree-4 Bézier with 5 control points:
 *   P0 = start
 *   P1 = (start.x, midY)  - ensures the curve exits the source handle vertically
 *   P2 = offset point     - pulled perpendicularly to the side to offset the curve and prevent overlap
 *   P3 = (end.x, midY)    - ensures the curve enters the target handle vertically
 *   P4 = end
 *
 * For offset=0, P2 sits at the geometric center (midX, midY), reproducing React Flow's default
 * bezier. For non-zero offsets, P2 is shifted perpendicular to the edge direction.
 *
 * Since SVG doesn't support quartic Béziers, this is converted to two cubic segments via
 * `quarticToSvgPath`. I still think it's worth to use a quartic logically because moving one
 * control point to create offset is easier for me to think about. Would be great if we could avoid
 * this logic by using ELK to layout the edges, but I couldn't figure that out (see comment on
 * `EdgeLayoutData`).
 */
const generateBezierPath = (start: Point, end: Point, parallelOffsetIndex: number) => {
  const offset = parallelOffsetIndex * parallelOffsetSpacing;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // P1 and P3 are pinned to ensure vertical tangents at the handles.
  const p1 = { x: start.x, y: midY };
  const p3 = { x: end.x, y: midY };

  if (offset === 0) {
    // P2 at geometric center — reproduces React Flow's default bezier curve.
    return quarticToSvgPath(start, p1, { x: midX, y: midY }, p3, end);
  }

  // Make edges point in the same direction so that two opposite-direction edges with opposite
  // offset indexes (e.g. -1 and 1) don't have identically-offset paths.
  const [canonicalStart, canonicalEnd] =
    start.y < end.y || (start.y === end.y && start.x <= end.x) ? [start, end] : [end, start];

  // dx and dy represent the vector from `start` to `end`
  const dx = canonicalEnd.x - canonicalStart.x;
  const dy = canonicalEnd.y - canonicalStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return throwError("Start and end points shouldn't be the same", start, end);

  // unit vector because we only care about the direction for offsetting, not the magnitude
  // (-dy, dx) gives a 90 degree rotation to the right
  const perpendicularUnitVector = {
    x: -dy / len,
    y: dx / len,
  };

  // P2 is the single offset control point, shifted perpendicularly to the (start, end) edge.
  const p2 = {
    x: midX + perpendicularUnitVector.x * offset,
    y: midY + perpendicularUnitVector.y * offset,
  };

  return quarticToSvgPath(start, p1, p2, p3, end);
};

/**
 * If `avoidEdgeLabelOverlap` is true and there are edge bendpoints from the ELK layout, use the
 * bend points to draw a complex path; otherwise draw a simple bezier between the source and target.
 *
 * TODO: modify complex-path algorithm such that curve has vertical slopes at start and end points.
 * Tried inserting a control point directly below `startPoint` and above `endPoint`, and that
 * resulted in vertical slopes, but the curve to/from the next bend points became jagged.
 */
export const getPathDefinitionForEdge = (
  edgeLayoutData: EdgeLayoutData,
  avoidEdgeLabelOverlap: boolean,
) => {
  const { sourcePoint, targetPoint, bendPoints, labelPosition, parallelOffsetIndex } =
    edgeLayoutData;

  if (!avoidEdgeLabelOverlap || bendPoints.length === 0) {
    // TODO?: probably ideally would draw this path through the ELK label position if that's provided
    return generateBezierPath(sourcePoint, targetPoint, parallelOffsetIndex ?? 0);
  }

  /**
   * Note: source/end points will be off a little because they don't include the size of the handles.
   * `flowEdge.source`/`.target` do, but they require a little hackery to work with flipped edges, and
   * they don't have anything to do with ELK's bendpoints.
   *
   * However: the layout's bend points near the start/end might be too high/low and need to shift
   * down/up in order to make the curve smooth when pointing to the node handles.
   */
  const points = [sourcePoint, ...bendPoints, targetPoint];

  // Awkwardly need to filter out duplicates because of a bug in the layout algorithm.
  // Should be able to remove this logic after https://github.com/eclipse/elk/issues/1085.
  const pointsWithoutDuplicates = points.filter((point, index) => {
    const pointBefore = points[index - 1];
    if (index === 0 || pointBefore === undefined) return true;
    return pointBefore.x !== point.x || pointBefore.y !== point.y;
  });
  const bendPointsWithoutDuplicates = pointsWithoutDuplicates.slice(1, -1);

  const pathDefinition = drawBezierCurvesFromPoints(
    sourcePoint,
    bendPointsWithoutDuplicates,
    targetPoint,
  );

  const { x: labelX, y: labelY } = labelPosition
    ? // Note: ELK label position is moved left by half of its width in order to center it.
      { x: labelPosition.x + 0.5 * scalePxViaDefaultFontSize(labelWidthPx), y: labelPosition.y }
    : getPathMidpoint(pathDefinition);

  return { pathDefinition, labelX, labelY };
};

const getPathMidpoint = (pathDefinition: string) => {
  // This seems like a wild solution to calculate label position based on svg path,
  // but on average, this takes 0.05ms per edge; 100 edges would take 5ms, which seems plenty fast enough.
  // Note: got this from github copilot suggestion.
  // Also tried reusing one `path` element globally, re-setting its `d` attribute each time,
  // but that didn't seem to save any significant amount of performance.
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathDefinition);
  const pathLength = path.getTotalLength();

  return path.getPointAtLength(pathLength / 2);
};

interface Point {
  x: number;
  y: number;
}

/**
 * Copied mostly from https://github.com/eclipse/elk/issues/848#issuecomment-1248084547
 *
 * Could refactor to ensure everything is safer, but logic seems fine enough to trust.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statements */
/* eslint-disable functional/immutable-data */
const drawBezierCurvesFromPoints = (
  startPoint: Point,
  bendPoints: Point[],
  endPoint: Point,
): string => {
  // If no bend points, we should've drawn a simple curve before getting here
  if (bendPoints.length === 0) throwError("Expected bend points", startPoint, bendPoints, endPoint);

  // not sure why end is treated as a control point, but algo seems to work and not sure a better name
  const controlPoints = [...bendPoints, endPoint];

  const path = [`M ${ptToStr(startPoint)}`];

  // if there are groups of 3 points, draw cubic bezier curves
  if (controlPoints.length % 3 === 0) {
    for (let i = 0; i < controlPoints.length; i = i + 3) {
      const [c1, c2, p] = controlPoints.slice(i, i + 3);
      path.push(`C ${ptToStr(c1!)}, ${ptToStr(c2!)}, ${ptToStr(p!)}`);
    }
  }
  // if there's an even number of points, draw quadratic curves
  else if (controlPoints.length % 2 === 0) {
    for (let i = 0; i < controlPoints.length; i = i + 2) {
      const [c, p] = controlPoints.slice(i, i + 2);
      path.push(`Q ${ptToStr(c!)}, ${ptToStr(p!)}`);
    }
  }
  // else, add missing points and try again
  // https://stackoverflow.com/a/72577667/1010492
  else {
    for (let i = controlPoints.length - 3; i >= 2; i = i - 2) {
      const missingPoint = midPoint(controlPoints[i - 1]!, controlPoints[i]!);
      controlPoints.splice(i, 0, missingPoint);
    }
    const newBendPoints = controlPoints.slice(0, -1);
    return drawBezierCurvesFromPoints(startPoint, newBendPoints, endPoint);
  }

  return path.join(" ");
};

export const midPoint = (pt1: Point, pt2: Point) => {
  return {
    x: (pt2.x + pt1.x) / 2,
    y: (pt2.y + pt1.y) / 2,
  };
};

export const ptToStr = ({ x, y }: Point) => {
  return `${x} ${y}`;
};
