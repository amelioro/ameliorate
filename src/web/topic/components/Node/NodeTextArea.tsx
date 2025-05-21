import styled from "@emotion/styled";
import { TextareaAutosize } from "@mui/material";
import { memo, useEffect, useState } from "react";

import { clearNewlyAddedNode, isNodeNewlyAdded } from "@/web/common/store/ephemeralStore";
import { WorkspaceContextType } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setNodeLabel } from "@/web/topic/store/actions";

interface Props {
  nodeId: string;
  nodeText: string;
  context: WorkspaceContextType;
  editable: boolean;
}

const NodeTextAreaBase = ({ nodeId, nodeText, context, editable }: Props) => {
  const [textAreaSelected, setTextAreaSelected] = useState(false);
  const textAreaId = `${nodeId}-${context}-textarea`;

  useEffect(() => {
    if (!isNodeNewlyAdded(nodeId, context)) return;

    clearNewlyAddedNode();

    // Focus newly added node's text.
    // Using timeout because textarea doesn't pull focus via `.focus()` without it. textarea is in DOM at this point, so I'm not sure why.
    setTimeout(() => {
      // Using getElementById instead of ref because ref.current is null after the timeout runs, unless timeout = 0 ms.
      // But when timeout = 0 ms, while focus is successfully pulled to the textarea, focus is pulled back to document body afterwards for some reason.
      // Think that's something to do with how we're rendering the diagram - it doesn't happen for details/table nodes.
      const textAreaEl = document.getElementById(textAreaId) as HTMLTextAreaElement | null;
      textAreaEl?.focus();
      textAreaEl?.setSelectionRange(0, textAreaEl.value.length);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't care about re-focusing after initial render
  }, []);

  return (
    <StyledTextareaAutosize
      id={textAreaId}
      // Change key if `node.data.label` changes so that textarea re-renders with new default value.
      // This is mainly intended for when the label changes from an external source
      // e.g. undo/redo, changing from the node in the details pane while this one is in the diagram, etc.
      key={textAreaId + nodeText}
      placeholder="Enter text..."
      defaultValue={nodeText}
      maxRows={3}
      onClick={(event) => {
        // Track selection of the textbox separate from node selection so that we can allow operations
        // like context menu & dragging to be text-specific when interacting with the text (e.g.
        // highlighting specific words, right-click search-with-google), vs node-specific when
        // interacting with the node (e.g. panning, right-click delete/show/hide).
        // It's a bit janky that we're setting this on click and unsetting on blur (as opposed
        // to onclick/onclickaway or onfocus/onblur), but onclickaway isn't a native thing, and
        // onfocus doesn't work because context menu events happen based on the focused element,
        // so we can't conditionally allow custom context menu vs browser context menu based on
        // whether or not the text area is focused.
        if (!textAreaSelected) setTextAreaSelected(true);
        // Prevent selecting node when we want to just edit text.
        // Particularly important for enabling text editing in details pane without selecting the node.
        event.stopPropagation();
      }}
      onContextMenu={(event) => {
        if (textAreaSelected) {
          // use chrome's context menu instead of our custom context menu if we're editing the text area
          // because in this case, we probably want the context menu to be based on the text
          event.stopPropagation();
        }
      }}
      onBlur={(event) => {
        if (textAreaSelected) setTextAreaSelected(false);
        if (event.target.value !== nodeText) setNodeLabel(nodeId, event.target.value);
      }}
      className={textAreaSelected ? "nopan" : ""} // allow regular text input drag functionality without using reactflow's pan behavior
      // Previously required selecting a node before editing its text, because oftentimes you'll
      // want to select a node to view more details and the editing will be distracting, but
      // "cursor: pointer" on the node box allows selecting the node without clicking the text.
      // We'll want to keep an eye out on if selecting vs editing is annoying on mobile, because
      // of the lack of hover to convey which one your click will perform.
      readOnly={!editable}
      spellCheck="false" // often may use terms not in dictionary, and we override browser context menu so we can't "add to dictionary"
    />
  );
};

const StyledTextareaAutosize = styled(TextareaAutosize)`
  padding: 0;
  border: 0;
  resize: none;
  outline: none;
  text-align: center;
  align-self: center;
  background-color: transparent;
  width: 100%;
  font-size: 1rem;
  line-height: 1;
  font-family: inherit;

  // We're fitting text by changing fontsize, so we shouldn't need scrollbars.
  // If we conditionally show them, and they're currently showing, we'd need to remove them in order
  // for the fontsize calc to check if text would fit without them (because there's more space for text without a scrollbar).
  overflow-y: hidden;
`;

export const NodeTextArea = memo(NodeTextAreaBase);
