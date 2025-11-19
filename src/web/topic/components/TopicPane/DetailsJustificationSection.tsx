import { Box, Stack, Typography } from "@mui/material";

import { justificationNodeTypes } from "@/common/node";
import { ImpliedClaimText } from "@/web/topic/components/ImpliedClaimText";
import { JustificationTreeIndicator } from "@/web/topic/components/Indicator/JustificationTreeIndicator";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthRem } from "@/web/topic/components/Node/EditableNode.styles";
import { useTopLevelJustification } from "@/web/topic/diagramStore/graphPartHooks";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { isJustificationEdge } from "@/web/topic/utils/justification";

interface Props {
  graphPart: GraphPart;
}

export const DetailsJustificationSection = ({ graphPart }: Props) => {
  const { supports, critiques } = useTopLevelJustification(graphPart.id);

  if (isJustificationEdge(graphPart)) return <></>; // justification edges can't have their own justifications

  const isJustificationNode = isNode(graphPart) && justificationNodeTypes.includes(graphPart.type);

  return (
    <>
      {/* `-mt-2` is to make this look like a subheading of the Justification section. */}
      {/* Ideally it'd probably be significantly cleaner to just remove the mb-2 on the heading, and/or */}
      {/* to move this subheading to be next to the heading, but didn't want to deal with refactoring right now. */}
      <Typography className="-mt-2 mb-2 px-2 pb-1 text-center text-sm text-slate-500">
        Claim: <ImpliedClaimText graphPart={graphPart} />
      </Typography>

      {/* spacing is the amount that centers the add buttons above the columns */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        marginBottom="8px"
        spacing={6}
      >
        <AddNodeButton
          fromNodeId={graphPart.id}
          // TODO: remove root claims with edge directly to argued part
          addableRelation={{
            source: "support",
            name: "supports",
            target: isJustificationNode ? graphPart.type : "rootClaim",
            as: "source",
          }}
          selectNewNode={false}
        />
        <JustificationTreeIndicator
          graphPartId={graphPart.data.arguedDiagramPartId ?? graphPart.id}
        />
        <AddNodeButton
          fromNodeId={graphPart.id}
          // TODO: remove root claims with edge directly to argued part
          addableRelation={{
            source: "critique",
            name: "critiques",
            target: isJustificationNode ? graphPart.type : "rootClaim",
            as: "source",
          }}
          selectNewNode={false}
        />
      </Stack>

      <Box
        className="flex flex-wrap justify-center gap-0.5 *:shrink-0"
        // ensure "No X yet!" takes up the same width as the nodes
        sx={{ "& > div": { width: `${nodeWidthRem}rem` } }}
      >
        <div className="flex flex-col items-center gap-0.5">
          {supports.length > 0 ? (
            supports.map((support) => <EditableNode key={support.id} node={support} />)
          ) : (
            <Typography variant="body2">No supports yet!</Typography>
          )}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {critiques.length > 0 ? (
            critiques.map((critique) => <EditableNode key={critique.id} node={critique} />)
          ) : (
            <Typography variant="body2">No critiques yet!</Typography>
          )}
        </div>
      </Box>
    </>
  );
};
