import { StyledButton, StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
}

export function AddNodeButtonGroup({ className }: Props) {
  return (
    <>
      <StyledButtonGroup
        variant="contained"
        aria-label="add node button group"
        className={className}
      >
        <StyledButton>Problem</StyledButton>
        <StyledButton>Solution</StyledButton>
      </StyledButtonGroup>
    </>
  );
}
