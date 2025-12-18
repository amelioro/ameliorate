import { Add } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Divider,
  ListItem,
  ListSubheader,
  TextField,
  useTheme,
} from "@mui/material";
import fuzzysort from "fuzzysort";
import { memo, useCallback, useRef, useState } from "react";

import { NodeType, compareNodesByType, prettyNodeTypes } from "@/common/node";
import { Menu } from "@/web/common/components/Menu/Menu";
import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { connectNodes, deleteEdge } from "@/web/topic/diagramStore/createDeleteActions";
import { useConnectableNodes } from "@/web/topic/diagramStore/nodeHooks";
import {
  DirectedToRelation,
  DirectedToRelationWithCommonality,
  getDirectedRelationDescription,
} from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";
import { useExpandAddNodeButtons } from "@/web/view/userConfigStore";

const getOptionText = (node: Node) => {
  const title = prettyNodeTypes[node.type];
  return `${title}: ${node.data.label}`;
};

interface AddMenuSearchProps {
  fromNodeId: string;
  addableRelations: DirectedToRelation[];
  className?: string;
}

const AddMenuSearch = ({ fromNodeId, addableRelations, className }: AddMenuSearchProps) => {
  const theme = useTheme();

  const { connected, notConnected } = useConnectableNodes(fromNodeId, addableRelations);

  const connectable = [
    // nicer to see the nodes sorted by type in the dropdown
    ...connected.toSorted(compareNodesByType),
    ...notConnected.toSorted(compareNodesByType),
  ];

  return (
    // TODO(bug): for some reason if you click in the search box, click away, and click back in,
    // sometimes random things get rendered above/on-the-top-half-of the search box, e.g. sometimes
    // the summary tabs appear over the top of the search box, so it seems like something is really
    // messed up, and Chrome is just double rendering random other things on the page here?
    <Autocomplete
      options={connectable}
      value={connected}
      getOptionLabel={(connectableNode) => getOptionText(connectableNode)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_event, _options, reason, details) => {
        const optionNode = details?.option;
        if (optionNode) {
          if (reason === "selectOption" && optionNode.addableRelationToNode) {
            if (optionNode.addableRelationToNode.as === "target") {
              connectNodes(fromNodeId, optionNode.addableRelationToNode.name, optionNode.id);
            } else {
              connectNodes(optionNode.id, optionNode.addableRelationToNode.name, fromNodeId);
            }
          } else if (reason === "removeOption" && optionNode.existingEdge) {
            deleteEdge(optionNode.existingEdge.id);
          }
        }
      }}
      fullWidth
      slotProps={{
        chip: { className: "max-w-40" }, // small enough that the limited tag text (e.g. "+5") fits in one line with the chip
        listbox: { className: "text-sm" }, // match size of menu item text
      }}
      multiple
      limitTags={1}
      disableClearable // so that we can handle adding/removing selections individually without needing to handle multiple changes at once
      disableCloseOnSelect // should be able to select or deselect a few without having to reopen the menu
      size="small"
      // make sure the search box at least fits a few words, but doesn't expand too widely either
      className={"w-72" + (className ? ` ${className}` : "")}
      onKeyDown={(event) => event.stopPropagation()} // don't trigger parent menu's default keydown handler, which e.g. makes "a" select "Add Cause" menu item instead of typing in the search box
      renderInput={(params) => (
        <TextField
          label="Connected nodes"
          className="[&_input]:text-sm [&_label.MuiInputLabel-root:not(.MuiInputLabel-shrink)]:text-sm"
          {...params}
        />
      )}
      // use a more advanced (fuzzy) search than MUI's default
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) return options;

        const results = fuzzysort.go(
          inputValue,
          options.map((option) => ({
            ...option,
            filterKey: getOptionText(option),
          })),
          { key: "filterKey" },
        );

        return results.map((result) => result.obj);
      }}
      // ensure node type icon is rendered along with highlighted matching chars from the search
      renderOption={(props, option, { inputValue }) => {
        const { NodeIcon } = nodeDecorations[option.type];
        const optionText = getOptionText(option);

        const result = fuzzysort.single(inputValue, optionText);

        return (
          <li {...props} key={option.id}>
            <div className="flex items-center">
              <NodeIcon
                className="mr-2 rounded-sm p-0.5"
                sx={{ backgroundColor: theme.palette[option.type].main }}
              />
              <span>
                {result
                  ? result
                      /**
                       * Add our own start/end so that we can `split` and always have the highlighted
                       * parts be odd-indexed. E.g. "<b>blah<b>", "bl<b>a<b>h", "bla<b>h<b>" will all
                       * have `split` result in highlighting the part at index 1.
                       *
                       * `highlight` defaults to `<b></b>`, which isn't splittable, and we don't want
                       * to dangerously set HTML if we don't have to.
                       */
                      .highlight("<b>", "<b>")
                      .split("<b>")
                      .map((text, index) =>
                        // see above - highlighted parts will always be at odd indices
                        index % 2 === 1 ? <b key={index}>{text}</b> : text,
                      )
                  : optionText}
                <i className="text-slate-400">
                  {/* ideally the `existingEdge` would probably use the same format of relation description, but that'd require grabbing the source/target node types from the edge, which is a bit annoying to do, and showing at least the edge label seems fine enough */}
                  {` (${option.addableRelationToNode ? getDirectedRelationDescription(option.addableRelationToNode) : option.existingEdge.label})`}
                </i>
              </span>
            </div>
          </li>
        );
      }}
    />
  );
};

const getDirectedRelationKey = (relation: DirectedToRelation) => {
  return `${relation.source}-${relation.name}-${relation.target}-${relation.as}`;
};

type AddableProps =
  | {
      fromNodeId: string;
      addableRelations: DirectedToRelationWithCommonality[];
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

/**
 * There's a ton of extra complexity in this component because the UX for whether or not we're
 * expanding the common add node buttons is pretty different.
 *
 * I'm hoping to eventually choose one UX to always use without configuration, but it doesn't feel
 * like one of these two options is obviously better right now.
 */
const AddNodeButtonGroup = memo(
  ({
    fromNodeId,
    addableRelations,
    addableNodeTypes,
    title,
    selectNewNode,
    openDirection = "bottom",
    className,
  }: Props & AddableProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    const expandAddNodeButtons = useExpandAddNodeButtons();

    const commonNodeButtons = addableRelations
      ? addableRelations
          .filter((relation) => relation.commonality === "common")
          .map((addableRelation) => (
            <AddNodeButton
              key={getDirectedRelationKey(addableRelation)}
              fromNodeId={fromNodeId}
              addableRelation={addableRelation}
              buttonType={!expandAddNodeButtons ? "menu" : "button"}
              selectNewNode={selectNewNode}
              tooltipDirection={openDirection}
              onClick={closeMenu}
            />
          ))
      : addableNodeTypes.map((addableNodeType) => (
          <AddNodeButton
            key={addableNodeType}
            addableNodeType={addableNodeType}
            buttonType={!expandAddNodeButtons ? "menu" : "button"}
            selectNewNode={selectNewNode}
            tooltipDirection={openDirection}
            onClick={closeMenu}
          />
        ));

    const uncommonNodeButtons = addableRelations
      ? addableRelations
          .filter((relation) => relation.commonality === "uncommon")
          .map((addableRelation) => (
            <AddNodeButton
              key={getDirectedRelationKey(addableRelation)}
              fromNodeId={fromNodeId}
              addableRelation={addableRelation}
              // trying out how it feels to have "expanded" only expand common buttons, keeping uncommon stuff in the menu still
              buttonType="menu"
              selectNewNode={selectNewNode}
              tooltipDirection={openDirection}
              onClick={closeMenu}
            />
          ))
          .concat([
            <ListItem key="add-menu-search" disablePadding={false}>
              <AddMenuSearch
                fromNodeId={fromNodeId}
                addableRelations={addableRelations}
                className="mt-1 text-sm"
              />
            </ListItem>,
          ])
      : []; // right now addable node types are all assumed to be common

    const menuButtonTitle = title ?? (!expandAddNodeButtons ? "Add node" : "Add more");

    return (
      <>
        <ButtonGroup
          variant="contained"
          aria-label="add node button group"
          className={
            // default for button group is inline-flex, but that creates different spacing than flex, and flex spacing seems nicer
            "flex" +
            // keep the button rendered if the menu is open (if button was only open due to hover, it'd otherwise disappear)
            (menuOpen ? " flex!" : "") +
            // If the menu button only has uncommon options, make it stand out less - this way users
            // are slightly encouraged to add nodes in the direction that is intended to commonly
            // be added; e.g. problem nodes have problem details added below, and solution nodes
            // have solution details added above.
            (expandAddNodeButtons || commonNodeButtons.length > 0 ? "" : " shadow-slate-300") +
            (className ? ` ${className}` : "")
          }
        >
          {expandAddNodeButtons ? commonNodeButtons : null}

          {/* don't show add menu button if it won't have anything in it */}
          {(!expandAddNodeButtons || uncommonNodeButtons.length > 0) && (
            <Tooltip
              tooltipHeading={
                menuButtonTitle +
                (expandAddNodeButtons || commonNodeButtons.length > 0 ? "" : " (uncommon)")
              }
              placement={openDirection}
              childrenOpensAMenu={true}
              immediatelyOpenOnTouch={false}
              childrenHideViaCss={true}
            >
              <Button
                ref={buttonRef}
                color={
                  !expandAddNodeButtons && commonNodeButtons.length > 0 ? "neutral" : "paperPlain"
                }
                size="small"
                variant="contained"
                onClick={(event) => {
                  event.stopPropagation(); // don't trigger deselection of node
                  setMenuOpen(true);
                }}
              >
                <Add />
              </Button>
            </Tooltip>
          )}
        </ButtonGroup>

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
            root: { onClick: (event: React.MouseEvent) => event.stopPropagation() }, // don't trigger deselection of node when clicking backdrop to close menu
            paper: { id: "add-button-menu-paper" },
          }}
          // Not sure if this is worth but this prevents the annoying scenario where you accidentally
          // drag on the menu, which can result in selecting a bunch of text unintentionally (including
          // text across the app's various panes, if you drag far enough).
          // Seems like there isn't much downside since you already can't select menu item text, since
          // they're buttons with click actions.
          className="select-none"
        >
          {!expandAddNodeButtons &&
            commonNodeButtons.length > 0 &&
            uncommonNodeButtons.length > 0 && (
              <ListSubheader className="leading-loose">Common</ListSubheader>
            )}
          {!expandAddNodeButtons && commonNodeButtons}
          {!expandAddNodeButtons &&
            commonNodeButtons.length > 0 &&
            uncommonNodeButtons.length > 0 && <Divider />}
          {!expandAddNodeButtons && uncommonNodeButtons.length > 0 && (
            <ListSubheader className="leading-loose">Uncommon</ListSubheader>
          )}
          {uncommonNodeButtons}
        </Menu>
      </>
    );
  },
);

// eslint-disable-next-line functional/immutable-data
AddNodeButtonGroup.displayName = "AddNodeButtonGroup";
export { AddNodeButtonGroup };
