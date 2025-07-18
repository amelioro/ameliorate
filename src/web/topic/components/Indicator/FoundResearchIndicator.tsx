import { Code, InfoOutlined, SchoolOutlined } from "@mui/icons-material";
import { PaletteColor, useTheme } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { ContentIndicator } from "@/web/topic/components/Indicator/Base/ContentIndicator";
import { useResearchNodes } from "@/web/topic/diagramStore/graphPartHooks";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { getHighestScore, getScoreColor } from "@/web/topic/utils/score";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  bgColor: string;
}

export const FoundResearchIndicator = ({ graphPartId, bgColor }: Props) => {
  const theme = useTheme();

  const { facts, sources } = useResearchNodes(graphPartId);
  const foundResearchNodes = facts.concat(sources);
  const { scoresByGraphPartId, scoreMeaning } = useDisplayScores(
    foundResearchNodes.map((node) => node.id),
  );

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewResearch");
  }, [graphPartId]);

  if (foundResearchNodes.length === 0) return <></>;

  const highestScore = getHighestScore(Object.values(scoresByGraphPartId));
  // could just color if score is > 5, to avoid bringing attention to unimportant things, but it seems nice to have the visual indication of a low score too
  const scoreColor = getScoreColor(highestScore, scoreMeaning);
  // paperPlain is a color intended to not stand out here - use the part's color in this case so it blends in with the part better
  const color =
    scoreColor === "paperPlain" ? bgColor : (theme.palette[scoreColor] as PaletteColor).main;

  if (facts.length > 0 && sources.length > 0)
    return (
      <ContentIndicator
        Icon={SchoolOutlined}
        title={`Has ${facts.length} facts and ${sources.length} sources`}
        onClick={onClick}
        bgColor={color}
      />
    );
  else if (facts.length > 0)
    return (
      <ContentIndicator
        Icon={InfoOutlined}
        title={`Has ${facts.length} facts`}
        onClick={onClick}
        bgColor={color}
      />
    );
  else
    return (
      <ContentIndicator
        Icon={Code}
        title={`Has ${sources.length} sources`}
        onClick={onClick}
        bgColor={color}
      />
    );
};
