import { Cancel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { closeClaimTree } from "../../../view/navigateStore";
import { useClaimTree } from "../../store/store";
import { Diagram } from "./Diagram";

interface Props {
  arguedDiagramPartId: string;
}

export const ClaimTree = ({ arguedDiagramPartId }: Props) => {
  const diagram = useClaimTree(arguedDiagramPartId);

  return (
    <>
      <IconButton
        onClick={() => closeClaimTree()}
        color="primary"
        sx={{ position: "absolute", zIndex: 1, right: 0 }}
      >
        <Cancel />
      </IconButton>

      <Diagram {...diagram} />
    </>
  );
};
