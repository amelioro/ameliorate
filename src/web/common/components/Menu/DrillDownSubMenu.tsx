import { ChevronRight } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem, MenuList, type MenuListProps } from "@mui/material";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  DrillDownDepthContext,
  useDrillDownDepthContext,
  useMobileMenuDrawerContext,
} from "@/web/common/components/Menu/MobileMenuDrawer";

interface Props {
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
 * Mobile counterpart of FlyoutSubMenu. Instead of opening a Popper to the right,
 * the MobileMenuDrawer's contents are replaced with this submenu's children using a Portal.
 *
 * The trigger MenuItem is always rendered in the parent's list. When this item is
 * on the drawer's active path and is the deepest active level, it portals its children into
 * the MobileMenuDrawer's submenu container — making them the single visible page.
 *
 * When this item is on the active path but NOT the deepest level (i.e. intermediate),
 * children are mounted hidden so that deeper DrillDownSubMenus in the subtree can
 * evaluate and potentially portal their own children.
 *
 * Children stay in the React tree (not stored in state), so they always re-render
 * with fresh props when state changes (e.g., toggle switches driven by Zustand
 * hooks stay up-to-date).
 */
export const DrillDownSubMenu = ({
  id,
  label,
  renderLabel,
  leftIcon,
  children,
  disabled,
  slotProps,
}: Props) => {
  const mobileMenuDrawer = useMobileMenuDrawerContext();
  const depth = useDrillDownDepthContext();

  if (!mobileMenuDrawer) return null;

  const { activePath, drillInto, subMenuContainerRef } = mobileMenuDrawer;
  // `id` is needed for items that use `renderLabel` (returns ReactNode), since a
  // ReactNode can't serve as a stable string identifier for path matching.
  const myId = id ?? label ?? "";
  const displayLabel = renderLabel ? renderLabel() : label;

  const isOnActivePath = activePath[depth]?.id === myId;
  const shouldDisplayChildren = isOnActivePath && activePath.length === depth + 1;
  const shouldRenderHiddenChildren = isOnActivePath && activePath.length > depth + 1; // still render these so deeper submenus can evaluate

  return (
    <>
      {/* Trigger — always rendered (so deeper menus can evaluate) but parent will hide it if drilled into a submenu */}
      <MenuItem
        disabled={disabled}
        onClick={() => drillInto({ id: myId, label: displayLabel, icon: leftIcon })}
      >
        {leftIcon ? <ListItemIcon>{leftIcon}</ListItemIcon> : <span />}
        {renderLabel ? (
          <ListItemText>{renderLabel()}</ListItemText>
        ) : (
          <ListItemText primary={label} />
        )}
        <ChevronRight />
      </MenuItem>

      {shouldDisplayChildren &&
        subMenuContainerRef.current &&
        createPortal(
          <DrillDownDepthContext.Provider value={depth + 1}>
            <MenuList {...slotProps?.list}>{children}</MenuList>
          </DrillDownDepthContext.Provider>,
          subMenuContainerRef.current,
        )}

      {shouldRenderHiddenChildren && (
        <div className="hidden">
          <DrillDownDepthContext.Provider value={depth + 1}>
            {children}
          </DrillDownDepthContext.Provider>
        </div>
      )}
    </>
  );
};
