import { Code, InfoOutlined, School } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { setSelected } from "../../../view/currentViewStore/store";
import { useResearchNodes } from "../../store/graphPartHooks";
import { useDisplayScores } from "../../store/scoreHooks";
import { Score } from "../../utils/graph";
import { getNumericScore, scoreColors } from "../../utils/score";
import { viewDetails } from "../TopicPane/paneStore";
import { Indicator } from "./Indicator";

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
    viewDetails();
  }, [graphPartId]);

  if (foundResearchNodes.length === 0) return <></>;

  const nodeScores = Object.values(scoresByGraphPart).map((score) => getNumericScore(score));
  const highestScore = Math.max(...nodeScores);

  const scoreColor =
    highestScore > 5
      ? (scoreColors[highestScore.toString() as Score] as ButtonProps["color"])
      : undefined;
  const color = scoreColor ?? partColor;

  if (facts.length > 0 && sources.length > 0)
    return (
      <Indicator
        Icon={School}
        title={`Has ${facts.length} facts and ${sources.length} sources`}
        onClick={onClick}
        iconHasBackground={false}
        color={color}
      />
    );
  else if (facts.length > 0)
    return (
      <Indicator
        Icon={InfoOutlined}
        title={`Has ${facts.length} facts`}
        onClick={onClick}
        iconHasBackground={false}
        color={color}
      />
    );
  else
    return (
      <Indicator
        Icon={Code}
        title={`Has ${sources.length} sources`}
        onClick={onClick}
        iconHasBackground={false}
        color={color}
      />
    );
};
