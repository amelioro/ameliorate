import { ThumbsUpDown } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { justificationNodeTypes } from "@/common/node";
import { ClaimTreeIndicator } from "@/web/topic/components/Indicator/ClaimTreeIndicator";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { useTopLevelClaims } from "@/web/topic/store/graphPartHooks";
import { isClaimEdge } from "@/web/topic/utils/claim";
import { GraphPart, isNode } from "@/web/topic/utils/graph";

interface Props {
  graphPart: GraphPart;
}

export const DetailsClaimsSection = ({ graphPart }: Props) => {
  const { supports, critiques } = useTopLevelClaims(graphPart.id);

  if (isClaimEdge(graphPart)) return <></>; // claim edges can't have their own claims

  const isClaimNode = isNode(graphPart) && justificationNodeTypes.includes(graphPart.type);

  return (
    <>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <ThumbsUpDown />
        </ListItemIcon>
        <ListItemText primary="Justification" />
      </ListItem>

      {/* spacing is the amount that centers the add buttons above the columns */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        marginBottom="8px"
        spacing={6}
      >
        <AddNodeButton
          fromPartId={graphPart.id}
          as="child"
          toNodeType="support"
          // TODO: remove root claims with edge directly to argued part
          relation={{
            child: "support",
            name: "supports",
            parent: isClaimNode ? graphPart.type : "rootClaim",
          }}
          selectNewNode={false}
        />
        <ClaimTreeIndicator graphPartId={graphPart.data.arguedDiagramPartId ?? graphPart.id} />
        <AddNodeButton
          fromPartId={graphPart.id}
          as="child"
          toNodeType="critique"
          // TODO: remove root claims with edge directly to argued part
          relation={{
            child: "critique",
            name: "critiques",
            parent: isClaimNode ? graphPart.type : "rootClaim",
          }}
          selectNewNode={false}
        />
      </Stack>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        spacing="2px"
        marginBottom={0.5}
      >
        <Stack width={nodeWidthPx} alignItems="center" spacing="2px">
          {supports.length > 0 ? (
            supports.map((support) => <EditableNode key={support.id} node={support} />)
          ) : (
            <Typography>No supports yet!</Typography>
          )}
        </Stack>

        <Stack width={nodeWidthPx} alignItems="center" spacing="2px">
          {critiques.length > 0 ? (
            critiques.map((critique) => <EditableNode key={critique.id} node={critique} />)
          ) : (
            <Typography>No critiques yet!</Typography>
          )}
        </Stack>
      </Stack>
    </>
  );
};
