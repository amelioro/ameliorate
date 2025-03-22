import { Code, InfoOutlined, SchoolOutlined } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { ContentIndicator } from "@/web/topic/components/Indicator/Base/ContentIndicator";
import { useResearchNodes } from "@/web/topic/store/graphPartHooks";
import { useDisplayScores } from "@/web/topic/store/scoreHooks";
import { Score } from "@/web/topic/utils/graph";
import { getNumericScore, scoreColors } from "@/web/topic/utils/score";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  partColor: ButtonProps["color"];
}

export const FoundResearchIndicator = ({ graphPartId, partColor }: Props) => {
  const { facts, sources } = useResearchNodes(graphPartId);
  const foundResearchNodes = facts.concat(sources);
  const scoresByGraphPart = useDisplayScores(foundResearchNodes.map((node) => node.id));

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewResearch");
  }, [graphPartId]);

  if (foundResearchNodes.length === 0) return <></>;

  const nodeScores = Object.values(scoresByGraphPart).map((score) => getNumericScore(score));
  const highestScore = Math.max(...nodeScores);

  // could just color if score is > 5, to avoid bringing attention to unimportant things, but it seems nice to have the visual indication of a low score too
  const scoreColor = scoreColors[highestScore.toString() as Score] as ButtonProps["color"];
  const color = scoreColor ?? partColor;

  if (facts.length > 0 && sources.length > 0)
    return (
      <ContentIndicator
        Icon={SchoolOutlined}
        title={`Has ${facts.length} facts and ${sources.length} sources`}
        onClick={onClick}
        color={color}
      />
    );
  else if (facts.length > 0)
    return (
      <ContentIndicator
        Icon={InfoOutlined}
        title={`Has ${facts.length} facts`}
        onClick={onClick}
        color={color}
      />
    );
  else
    return (
      <ContentIndicator
        Icon={Code}
        title={`Has ${sources.length} sources`}
        onClick={onClick}
        color={color}
      />
    );
};
