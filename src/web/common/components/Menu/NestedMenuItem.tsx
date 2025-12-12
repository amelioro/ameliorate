/**
 * AI-generated component that uses Popper + MenuList instead of Menu, in order to avoid the
 * "Blocked aria-hidden" console warning that comes from nesting a MUI Menu within another.
 *
 * The code is almost identical to the OG mui-nested-menu code https://github.com/steviebuilds/mui-nested-menu/blob/43a468a6b07fcad9a5c782a796a83547337511a7/packages/mui-nested-menu/src/components/NestedMenuItem.tsx,
 * except for the Popper/MenuList and some styling. This also doesn't implement some container prop
 * logic from mui-nested-menu. In any case, the functionality seems to work as expected, and without
 * the warning.
 *
 * This is really fragile because it's basically pasted-in + custom logic. There's a MUI issue that
 * should fix the warning (and underlying accessibility issue), hopefully it gets resolved and we
 * can just upgrade versions (see issue's associated PR for more discussion on it): https://github.com/mui/material-ui/issues/19450.
 * It seems like the core issue is that MUI's Modal manager sets aria-hidden on parent menus when
 * nested Menu modals are open, but when we open the nested menu, we still have focus on that parent.
 */

import { ChevronRight } from "@mui/icons-material";
import { ClickAwayListener, Grow, MenuList, Paper, Popper } from "@mui/material";
import { IconMenuItem } from "mui-nested-menu";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface Props {
  parentMenuOpen: boolean;
  label?: string;
  renderLabel?: () => ReactNode;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  tabIndex?: number;
}

export const NestedMenuItem = forwardRef<HTMLLIElement | null, Props>(
  function NestedMenuItem(props, ref) {
    const {
      parentMenuOpen,
      label,
      renderLabel,
      rightIcon = <ChevronRight />,
      leftIcon = null,
      children,
      className,
      disabled,
      tabIndex: tabIndexProp,
    } = props;

    const menuItemRef = useRef<HTMLLIElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => menuItemRef.current!);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const menuContainerRef = useRef<HTMLUListElement | null>(null);

    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

    const handleMouseEnter = (_e: MouseEvent<HTMLElement>) => {
      if (!disabled) {
        setIsSubMenuOpen(true);
      }
    };

    const handleMouseLeave = (_e: MouseEvent<HTMLElement>) => {
      setIsSubMenuOpen(false);
    };

    const isSubmenuFocused = () => {
      const active = containerRef.current?.ownerDocument.activeElement ?? null;
      if (menuContainerRef.current == null) {
        return false;
      }
      return Array.from(menuContainerRef.current.children).some(
        (child) => child === active || child.contains(active),
      );
    };

    const handleFocus = () => {
      if (!disabled) {
        setIsSubMenuOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        return;
      }

      if (isSubmenuFocused()) {
        e.stopPropagation();
      }

      const active = containerRef.current?.ownerDocument.activeElement;

      if (e.key === "ArrowLeft" && isSubmenuFocused()) {
        containerRef.current?.focus();
      }

      if (e.key === "ArrowRight" && e.target === containerRef.current && e.target === active) {
        const firstChild = menuContainerRef.current?.children[0] as HTMLElement | undefined;
        firstChild?.focus();
      }
    };

    const open = isSubMenuOpen && parentMenuOpen;

    const tabIndex = disabled ? undefined : tabIndexProp ?? -1;

    return (
      <div
        ref={containerRef}
        onFocus={handleFocus}
        tabIndex={tabIndex}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        <IconMenuItem
          MenuItemProps={{ disabled }}
          // match default mui menu padding and size
          className={"px-[16px] [&_p]:px-0 [&_p]:text-sm" + (className ? ` ${className}` : "")}
          ref={menuItemRef}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          label={label}
          renderLabel={renderLabel}
        />
        <Popper
          open={open}
          anchorEl={menuItemRef.current}
          placement="right-start"
          style={{ zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper elevation={8}>
                <ClickAwayListener onClickAway={() => setIsSubMenuOpen(false)}>
                  <MenuList ref={menuContainerRef} dense autoFocusItem={false}>
                    {children}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  },
);
