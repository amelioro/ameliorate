import { useTheme } from "@mui/material";
import _ from "lodash";

import { setNodeLabel } from "../../store/actions";
import { Node } from "../../utils/diagram";
import { nodeDecorations } from "../../utils/nodes";
import { CriteriaIndicator } from "../CriteriaIndicator/CriteriaIndicator";
import { CriteriaTableIndicator } from "../CriteriaTableIndicator/CriteriaTableIndicator";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import {
  IndicatorDiv,
  MiddleDiv,
  NodeDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
} from "./EditableNode.styles";

export const EditableNode = ({ node }: { node: Node }) => {
  const theme = useTheme();

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <NodeDiv color={color} className={node.selected ? "selected" : ""}>
      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "16px", height: "16px" }} />
          <NodeTypeSpan>{_.startCase(node.type)}</NodeTypeSpan>
        </NodeTypeDiv>
        <IndicatorDiv>
          <CriteriaTableIndicator nodeId={node.id} diagramId={node.data.diagramId} />
          <CriteriaIndicator nodeId={node.id} diagramId={node.data.diagramId} />
          <ScoreDial scorableId={node.id} scorableType="node" score={node.data.score} />
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
          value={node.data.label}
          maxRows={3}
          onChange={(event) => setNodeLabel(node.id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
        />
        <XEdgeDiv />
      </MiddleDiv>
      <YEdgeDiv />
    </NodeDiv>
  );
};
