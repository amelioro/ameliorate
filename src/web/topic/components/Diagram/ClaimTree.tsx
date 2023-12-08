import { Cancel } from "@mui/icons-material";

import { closeClaimTree } from "../../../view/navigateStore";
import { useClaimTree } from "../../store/store";
import { PositionedCloseButton } from "./ClaimTree.styles";
import { Diagram } from "./Diagram";

interface Props {
  arguedDiagramPartId: string;
}

export const ClaimTree = ({ arguedDiagramPartId }: Props) => {
  const diagram = useClaimTree(arguedDiagramPartId);

  return (
    <>
      <PositionedCloseButton onClick={() => closeClaimTree()} color="primary">
        <Cancel />
      </PositionedCloseButton>

      <Diagram {...diagram} />
    </>
  );
};
