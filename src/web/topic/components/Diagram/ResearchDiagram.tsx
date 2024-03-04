import { Cancel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { closeResearchDiagram } from "../../../view/navigateStore";
import { useResearchDiagram } from "../../store/store";
import { Diagram } from "./Diagram";

export const ResearchDiagram = () => {
  const diagram = useResearchDiagram();

  return (
    <>
      <IconButton
        onClick={() => closeResearchDiagram()}
        color="primary"
        sx={{ position: "absolute", zIndex: 1, right: 0 }}
      >
        <Cancel />
      </IconButton>

      <Diagram {...diagram} />
    </>
  );
};
