import { type MenuListProps } from "@mui/material";
import { type ReactNode } from "react";

import { DrillDownSubMenu } from "@/web/common/components/Menu/DrillDownSubMenu";
import { FlyoutSubMenu } from "@/web/common/components/Menu/FlyoutSubMenu";
import { useMobileMenuDrawerContext } from "@/web/common/components/Menu/MobileMenuDrawer";

interface Props {
  parentMenuOpen: boolean;
  id?: string;
  label?: string;
  renderLabel?: () => ReactNode;
  leftIcon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  slotProps?: {
    list?: Partial<MenuListProps>;
  };
}

/**
 * Renders a FlyoutSubMenu (desktop, popper to the right) or a DrillDownSubMenu
 * (mobile, portals children into the MobileMenuDrawer container) depending on context.
 */
export const ResponsiveSubMenu = ({
  parentMenuOpen,
  id,
  label,
  renderLabel,
  leftIcon,
  children,
  disabled,
  slotProps,
}: Props) => {
  const isMobile = useMobileMenuDrawerContext() !== null;

  if (isMobile) {
    return (
      <DrillDownSubMenu
        id={id}
        label={label}
        renderLabel={renderLabel}
        leftIcon={leftIcon}
        disabled={disabled}
        slotProps={slotProps}
      >
        {children}
      </DrillDownSubMenu>
    );
  }

  return (
    <FlyoutSubMenu
      parentMenuOpen={parentMenuOpen}
      label={label}
      renderLabel={renderLabel}
      leftIcon={leftIcon}
      disabled={disabled}
      slotProps={slotProps}
    >
      {children}
    </FlyoutSubMenu>
  );
};
