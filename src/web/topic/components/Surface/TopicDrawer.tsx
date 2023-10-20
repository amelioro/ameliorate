import { AutoStories, ChevronLeft, KeyboardArrowDown } from "@mui/icons-material";
import { useState } from "react";

import { PositionedDiv, StyledDrawer, ToggleDrawerButton } from "./TopicDrawer.styles";
import { TopicViews } from "./TopicViews";

interface Props {
  isLandscape: boolean;
}

export const TopicDrawer = ({ isLandscape }: Props) => {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isTopicDrawerOpen) {
      setIsTopicDrawerOpen(false);
    } else {
      setIsTopicDrawerOpen(true);
    }
  };

  const ToggleIcon = isTopicDrawerOpen
    ? isLandscape
      ? ChevronLeft
      : KeyboardArrowDown
    : AutoStories;

  return (
    <>
      {/* div to enable menu button to be positioned to the right of the drawer */}
      <PositionedDiv>
        <ToggleDrawerButton onClick={handleDrawerToggle} color="primary" isLandscape={isLandscape}>
          <ToggleIcon />
        </ToggleDrawerButton>
        {/* `permanent` because `persistent` adds transitions that conflict with our styles */}
        <StyledDrawer
          variant="permanent"
          open={isTopicDrawerOpen}
          anchor={isLandscape ? "left" : "bottom"}
          isLandscape={isLandscape}
        >
          <TopicViews />
        </StyledDrawer>
      </PositionedDiv>
    </>
  );
};
