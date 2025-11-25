import { School, Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useIsAbout } from "@/web/topic/diagramStore/summary";
import { DirectedToRelationWithCommonality } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const IsAboutColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useIsAbout(summaryNode);

  const addableRelations: DirectedToRelationWithCommonality[] = (
    [
      {
        source: "question",
        name: "asksAbout",
        target: summaryNode.type,
        as: "source",
        commonality: "common",
      },
    ] as DirectedToRelationWithCommonality[]
  ).concat(
    // disallow facts and sources as relevant for other facts and sources, because that gets confusing
    summaryNode.type !== "fact" && summaryNode.type !== "source"
      ? [
          {
            source: "fact",
            name: "relevantFor",
            target: summaryNode.type,
            as: "source",
            commonality: "common",
          },
          {
            source: "source",
            name: "relevantFor",
            target: summaryNode.type,
            as: "source",
            commonality: "common",
          },
        ]
      : [],
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row title="Research" Icon={School} addButtonsSlot={AddButtons} nodes={directNodes} />

      <Divider className="mx-2 my-1" />

      <Row
        title="Indirect"
        Icon={Timeline}
        endHeaderSlot={<IndirectHelpIcon />}
        nodes={indirectNodes}
      />
    </div>
  );
};
