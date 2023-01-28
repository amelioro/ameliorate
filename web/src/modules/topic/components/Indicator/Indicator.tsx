import { MuiIcon } from "../../utils/nodes";
import { StyledButton } from "./Indicator.styles";

interface IndicatorProps {
  Icon: MuiIcon;
  onClick?: () => void;
}

export const Indicator = ({ Icon, onClick }: IndicatorProps) => {
  return (
    // hard to tell which variant & color combo works best
    // want to use neutral generally, but not stand out too much (contained with neutral color stands out because of heavy black to fill in icon)
    // and have a clearly visible hover
    <StyledButton variant="contained" color="secondary" onClick={onClick} disabled={!onClick}>
      <Icon color="neutral" />
    </StyledButton>
  );
};
