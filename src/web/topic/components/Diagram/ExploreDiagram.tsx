import { Cancel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { closeExploreDiagram } from "../../../view/navigateStore";
import { useExploreDiagram } from "../../store/store";
import { Diagram } from "./Diagram";

export const ExploreDiagram = () => {
  const diagram = useExploreDiagram();

  return (
    <>
      <IconButton
        onClick={() => closeExploreDiagram()}
        color="primary"
        sx={{ position: "absolute", zIndex: 1, right: 0 }}
      >
        <Cancel />
      </IconButton>

      <Diagram {...diagram} />
    </>
  );
};
