import { HelpIcon } from "@/web/common/components/HelpIcon";
import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";

export const IndirectHelpIcon = () => (
  <IconWithTooltip
    tooltipHeading="Indirect Nodes"
    tooltipBody="Indirect nodes are connected to the summarized node through other nodes. For example, when viewing a solution, a benefit created by one of the solution's components will show here."
    icon={<HelpIcon />}
  />
);
