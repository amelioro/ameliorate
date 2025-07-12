import { useContext } from "react";

import { Indicator, IndicatorProps } from "@/web/topic/components/Indicator/Base/Indicator";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { useShowContentIndicators } from "@/web/view/userConfigStore";

export const ContentIndicator = ({
  Icon,
  title,
  onClick,
  bgColor,
  filled = false,
}: Omit<IndicatorProps, "className">) => {
  const workspaceContext = useContext(WorkspaceContext);
  const showContentIndicators = useShowContentIndicators();

  // Nice to always show in details view so there's some way for new users to be exposed to them.
  const showIndicator = workspaceContext === "details" || showContentIndicators;

  return (
    <Indicator
      Icon={Icon}
      title={title}
      onClick={onClick}
      bgColor={bgColor}
      filled={filled}
      className={showIndicator ? "" : "hidden"}
    />
  );
};
