import { Indicator, IndicatorProps } from "@/web/topic/components/Indicator/Base/Indicator";
import { useShowViewIndicators } from "@/web/view/userConfigStore";

export const ViewIndicator = ({
  Icon,
  title,
  onClick,
  color = "neutral",
  filled = true,
}: Omit<IndicatorProps, "className">) => {
  const showViewIndicators = useShowViewIndicators();

  const showIndicator = showViewIndicators;

  return (
    <Indicator
      Icon={Icon}
      title={title}
      onClick={onClick}
      color={color}
      filled={filled}
      className={showIndicator ? "" : "hidden"}
    />
  );
};
