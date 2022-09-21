import { Button, ButtonGroup, type SxProps, type Theme } from "@mui/material";

interface Props {
  sx?: SxProps<Theme>;
}

export function AddNodeButtonGroup({ sx }: Props) {
  return (
    <ButtonGroup
      variant="contained"
      aria-label="add node button group"
      sx={{
        ...sx,
        width: "100px",
        height: "15px",
      }}
    >
      <Button sx={{ fontSize: "0.5em" }}>Problem</Button>
      <Button sx={{ fontSize: "0.5em" }}>Solution</Button>
    </ButtonGroup>
  );
}
