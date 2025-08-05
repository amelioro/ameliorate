import { Add } from "@mui/icons-material";
import { Button, ButtonGroup } from "@mui/material";
import { memo, useCallback, useRef, useState } from "react";

import { NodeType } from "@/common/node";
import { Menu } from "@/web/common/components/Menu/Menu";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { DirectedToRelation } from "@/web/topic/utils/edge";
import { useExpandAddNodeButtons } from "@/web/view/userConfigStore";

type AddableProps =
  | {
      fromNodeId: string;
      addableRelations: DirectedToRelation[];
      addableNodeTypes?: undefined;
    }
  | {
      fromNodeId?: undefined;
      addableRelations?: undefined;
      addableNodeTypes: NodeType[];
    };

interface Props {
  title?: string;
  selectNewNode?: boolean;
  openDirection?: "top" | "bottom";
  className?: string;
}

const AddNodeButtonGroup = memo(
  ({
    fromNodeId,
    addableRelations,
    addableNodeTypes,
    title = "Add node",
    selectNewNode,
    openDirection = "bottom",
    className,
  }: Props & AddableProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    const expandAddNodeButtons = useExpandAddNodeButtons();

    const addNodeButtons = addableRelations
      ? addableRelations.map((addableRelation) => (
          <AddNodeButton
            key={addableRelation[addableRelation.as]}
            fromNodeId={fromNodeId}
            addableRelation={addableRelation}
            buttonType={!expandAddNodeButtons ? "menu" : "button"}
            selectNewNode={selectNewNode}
            onClick={closeMenu}
          />
        ))
      : addableNodeTypes.map((addableNodeType) => (
          <AddNodeButton
            key={addableNodeType}
            addableNodeType={addableNodeType}
            buttonType={!expandAddNodeButtons ? "menu" : "button"}
            selectNewNode={selectNewNode}
            onClick={closeMenu}
          />
        ));

    return !expandAddNodeButtons ? (
      <>
        <Button
          ref={buttonRef}
          title={title}
          aria-label={title}
          color="neutral"
          size="small"
          variant="contained"
          className={
            // keep the button rendered if the menu is open (if button was only open due to hover, it'd otherwise disappear)
            (menuOpen ? "!flex" : "") + (className ? ` ${className}` : "")
          }
          onClick={(event) => {
            event.stopPropagation(); // don't trigger deselection of node
            setMenuOpen(true);
          }}
        >
          <Add />
        </Button>
        <Menu
          anchorEl={buttonRef.current}
          open={menuOpen}
          openDirection={openDirection}
          onClose={() => {
            setMenuOpen(false);
            // For some reason if the button that opens this menu is going to hide after menu closes
            // (e.g. if the button itself is only showing because something is being hovered), then
            // when the menu is closing, it adds `aria-hidden` to itself, but its child `paper` will
            // be given focus for a moment, causing a warning.
            // This dodges the warning in a janky way I guess. Some explanation here https://github.com/mui/material-ui/issues/43106#issuecomment-2314809028
            document.getElementById("add-button-menu-paper")?.blur();
          }}
          slotProps={{
            root: { onClick: (event) => event.stopPropagation() }, // don't trigger deselection of node when clicking backdrop to close menu
            paper: { id: "add-button-menu-paper" },
          }}
        >
          {addNodeButtons}
        </Menu>
      </>
    ) : (
      <ButtonGroup variant="contained" aria-label="add node button group" className={className}>
        {addNodeButtons}
      </ButtonGroup>
    );
  },
);

// eslint-disable-next-line functional/immutable-data
AddNodeButtonGroup.displayName = "AddNodeButtonGroup";
export { AddNodeButtonGroup };
