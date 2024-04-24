import { icons } from "lucide-react";
import { memo } from "react";

import { cn } from "../utils";

export interface IconProps {
  name: keyof typeof icons;
  className?: string;
  strokeWidth?: number;
}

export const Icon = memo(({ name, className, strokeWidth }: IconProps) => {
  // eslint-disable-next-line import/namespace
  const IconComponent = icons[name];

  return <IconComponent className={cn("w-4 h-4", className)} strokeWidth={strokeWidth ?? 2.5} />;
});

// eslint-disable-next-line functional/immutable-data
Icon.displayName = "Icon";
