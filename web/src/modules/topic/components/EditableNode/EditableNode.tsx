import { Global } from "@emotion/react";
import { useTheme } from "@mui/material";
import _ from "lodash";
import { Handle, Position } from "reactflow";

import { setNodeLabel } from "../../store/actions";
import { useDiagramType } from "../../store/store";
import { orientations } from "../../utils/diagram";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { CriteriaIndicator } from "../CriteriaIndicator/CriteriaIndicator";
import { NodeProps } from "../Diagram/Diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  HoverBridgeDiv,
  IndicatorDiv,
  MiddleDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
  nodeStyles,
} from "./EditableNode.styles";

export const EditableNode = ({ id, data, type }: NodeProps) => {
  const diagramType = useDiagramType(data.diagramId);
  const theme = useTheme();

  if (!diagramType) return <></>;

  const orientation = orientations[diagramType];

  const nodeType = type as NodeType; // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
  const nodeDecoration = nodeDecorations[nodeType];
  const color = theme.palette[nodeType].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <>
      <HoverBridgeDiv />

      <Handle type="target" position={orientation == "TB" ? Position.Top : Position.Left} />
      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      <AddNodeButtonGroupParent
        fromNodeId={id}
        fromNodeType={nodeType}
        as="parent"
        orientation={orientation}
      />

      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "16px", height: "16px" }} />
          <NodeTypeSpan>{_.startCase(nodeType)}</NodeTypeSpan>
        </NodeTypeDiv>
        <IndicatorDiv>
          <CriteriaIndicator nodeId={id} diagramId={data.diagramId} />
          <ScoreDial scorableId={id} scorableType="node" score={data.score} />
        </IndicatorDiv>
      </YEdgeDiv>
      <MiddleDiv>
        <XEdgeDiv />
        <StyledTextareaAutosize
          color={color}
          placeholder="Enter text..."
          // Will cause re-render on every keystroke because of onChange, hopefully this is fine.
          // Was previously using defaultValue to avoid this, but that caused text to not update
          // when rendering for the second time (1. post-hydration value updating, see store, or
          // 2. when importing a new diagram but the node id's are the same).
          value={data.label}
          maxRows={3}
          onChange={(event) => setNodeLabel(id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
        />
        <XEdgeDiv />
      </MiddleDiv>
      <YEdgeDiv />

      <AddNodeButtonGroupChild
        fromNodeId={id}
        fromNodeType={nodeType}
        as="child"
        orientation={orientation}
      />
      <Handle type="source" position={orientation == "TB" ? Position.Bottom : Position.Right} />

      <Global styles={nodeStyles(data.width, color, nodeType)} />
    </>
  );
};
