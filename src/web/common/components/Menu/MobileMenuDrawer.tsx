import { ArrowBack } from "@mui/icons-material";
import { Drawer, IconButton, MenuList, type MenuListProps, Typography } from "@mui/material";
import {
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface PathSegment {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface MobileMenuDrawerContextValue {
  activePath: PathSegment[];
  drillInto: (segment: PathSegment) => void;
  drillBack: () => void;
  closeMobileMenu: () => void;
  subMenuContainerRef: RefObject<HTMLDivElement | null>;
}

const MobileMenuDrawerContext = createContext<MobileMenuDrawerContextValue | null>(null);

export const useMobileMenuDrawerContext = () => useContext(MobileMenuDrawerContext);

/**
 * Tracks the depth of nested DrillDownSubMenus so each one knows which level
 * of the activePath to compare against.
 */
const DrillDownDepthContext = createContext(0);

export const useDrillDownDepthContext = () => useContext(DrillDownDepthContext);
export { DrillDownDepthContext };

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  slotProps?: {
    list?: Partial<MenuListProps>;
  };
}

export const MobileMenuDrawer = ({
  open,
  onClose,
  title,
  children,
  slotProps,
}: MobileMenuDrawerProps) => {
  const [activePath, setActivePath] = useState<PathSegment[]>([]);
  const subMenuContainerRef = useRef<HTMLDivElement>(null);

  // Reset when the close transition finishes (rather than as soon as `open` becomes false) so that
  // the drawer doesn't jump back to the root menu while it's animating closed.
  // Also, this is needed separate from `closeMobileMenu` because our child menu items can close the
  // menu that encompasses this drawer, without calling our `closeMobileMenu`.
  const resetActivePath = useCallback(() => setActivePath([]), []);

  const drillInto = useCallback((segment: PathSegment) => {
    setActivePath((previousActivePath) => [...previousActivePath, segment]);
  }, []);

  const drillBack = useCallback(() => {
    setActivePath((previousActivePath) => previousActivePath.slice(0, -1));
  }, []);

  const contextValue = useMemo(
    () => ({ activePath, drillInto, drillBack, closeMobileMenu: onClose, subMenuContainerRef }),
    [activePath, drillInto, drillBack, onClose],
  );

  const currentSegment = activePath.at(-1) ?? null;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className:
            "w-full max-h-[80vh] rounded-t-xl overflow-x-hidden" +
            // prevent actions while animating closed, e.g. so that double-tapping "delete" doesn't try to delete twice
            (open ? "" : " pointer-events-none"),
        },
        transition: { onExited: resetActivePath },
      }}
    >
      <MobileMenuDrawerContext.Provider value={contextValue}>
        <DrillDownDepthContext.Provider value={0}>
          {currentSegment ? (
            <div className="flex items-center gap-1 border-b px-2 py-1">
              <IconButton onClick={drillBack} size="small">
                <ArrowBack />
              </IconButton>
              <div className="flex items-center gap-2">
                {currentSegment.icon}
                <Typography variant="h6" className="text-base font-medium">
                  {currentSegment.label}
                </Typography>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center border-b py-2">
              <Typography variant="h6" className="text-base font-medium">
                {title}
              </Typography>
            </div>
          )}

          {/* Root menu — hidden when drilled into any submenu.
              Stays mounted so intermediate DrillDownSubMenus can evaluate
              and portal their active children. */}
          <MenuList
            {...slotProps?.list}
            className={activePath.length > 0 ? "hidden" : "overflow-y-auto"}
          >
            {children}
          </MenuList>

          {/* Stable portal target — DrillDownSubMenus create portals here. */}
          <div ref={subMenuContainerRef} />
        </DrillDownDepthContext.Provider>
      </MobileMenuDrawerContext.Provider>
    </Drawer>
  );
};
