import { HelpOutline } from "@mui/icons-material";

import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";

export const IndirectHelpIcon = () => (
  <IconWithTooltip
    tooltipHeading="Indirect Nodes"
    tooltipBody="Indirect nodes are connected to the summarized node through other nodes. For example, when viewing a solution's summary, a benefit created by one of the solution's components will show here."
    icon={<HelpOutline fontSize="small" />}
  />
);
