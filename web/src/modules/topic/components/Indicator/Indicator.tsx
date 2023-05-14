import { MouseEventHandler, forwardRef } from "react";

import { MuiIcon } from "../../utils/node";
import { StyledButton } from "./Indicator.styles";

interface IndicatorProps {
  Icon: MuiIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Indicator = forwardRef<HTMLButtonElement, IndicatorProps>(
  function Indicator(props, ref){
    const { Icon, onClick } = props;
  
    return(
      // black outline looks a bit weird on the table icon, not sure how to easily fix though
      // also hover color diff for black is impossible to see, so a custom hover is added to darken the gray instead
      <StyledButton {...props} variant="contained" color="neutralContrast" onClick={onClick} disabled={!onClick} ref={ref}>
         <Icon color="neutral" />
      </StyledButton>

      // hard to tell which variant & color combo works best
      // want to use neutral generally, but not stand out too much (contained with neutral color stands out because of heavy black to fill in icon)
      // and have a clearly visible hover
      // below are the variants that have been considered:

      // passing nodeType color doesn't work for edges
      // <StyledButton variant="contained" color={nodeType} onClick={onClick} disabled={!onClick}>
      //   <Icon color="neutral" />
      // </StyledButton>

      // text variant hover doesn't do anything?
      // <StyledButton variant="text" color={nodeType} onClick={onClick} disabled={!onClick}>
      //   <Icon color="neutral" />
      // </StyledButton>

      // outlined variant adds border that feels awkward (halfway to being a shadow) and hover only increases border, so it's hard to see
      // <StyledButton variant="outlined" color="neutral" onClick={onClick} disabled={!onClick}>
      //   <Icon color="neutral" />
      // </StyledButton>

      // this follows the MUI example, but I can't actually see the hover at all
      // <StyledIconButton onClick={onClick} disabled={!onClick}>
      //   <Icon color="neutralContrast" />
      // </StyledIconButton>

      // no hover effect (this isn't even a button)
      // <Icon />
      
    )

  }

);
  