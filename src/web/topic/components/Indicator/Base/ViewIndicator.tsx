import { Indicator, IndicatorProps } from "@/web/topic/components/Indicator/Base/Indicator";
import { useShowViewIndicators } from "@/web/view/userConfigStore";

export const ViewIndicator = ({
  Icon,
  title,
  onClick,
  bgColor,
  filled = true,
}: Omit<IndicatorProps, "className">) => {
  const showViewIndicators = useShowViewIndicators();

  const showIndicator = showViewIndicators;

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
