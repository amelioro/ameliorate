import { ThumbsUpDown } from "@mui/icons-material";
import { Divider, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { claimNodeTypes } from "../../../../common/node";
import { useTopLevelClaims } from "../../store/graphPartHooks";
import { isClaimEdge } from "../../utils/claim";
import { GraphPart, isNode } from "../../utils/graph";
import { ClaimTreeIndicator } from "../Indicator/ClaimTreeIndicator";
import { AddNodeButton } from "../Node/AddNodeButton";
import { EditableNode } from "../Node/EditableNode";
import { nodeWidthPx } from "../Node/EditableNode.styles";

interface Props {
  graphPart: GraphPart;
}

export const DetailsClaimsSection = ({ graphPart }: Props) => {
  const { supports, critiques } = useTopLevelClaims(graphPart.id);

  if (isClaimEdge(graphPart)) return <></>; // claim edges can't have their own claims

  const isClaimNode = isNode(graphPart) && claimNodeTypes.includes(graphPart.type);

  return (
    <>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <ThumbsUpDown />
        </ListItemIcon>
        <ListItemText primary="Claims" />
      </ListItem>

      {/* spacing is the amount that centers the add buttons above the columns */}
      <Stack direction="row" justifyContent="center" alignItems="center" margin="8px" spacing={6}>
        <AddNodeButton
          fromNodeId={graphPart.id}
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
          fromNodeId={graphPart.id}
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

      <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing="2px">
        <Stack width={nodeWidthPx} alignItems="center" spacing="2px">
          {supports.length > 0 ? (
            supports.map((support) => <EditableNode key={support.id} node={support} supplemental />)
          ) : (
            <Typography>No supports yet!</Typography>
          )}
        </Stack>

        <Divider orientation="vertical" flexItem />

        <Stack width={nodeWidthPx} alignItems="center" spacing="2px">
          {critiques.length > 0 ? (
            critiques.map((critique) => (
              <EditableNode key={critique.id} node={critique} supplemental />
            ))
          ) : (
            <Typography>No critiques yet!</Typography>
          )}
        </Stack>
      </Stack>
    </>
  );
};
