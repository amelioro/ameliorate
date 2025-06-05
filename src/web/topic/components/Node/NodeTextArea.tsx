import styled from "@emotion/styled";
import { TextareaAutosize } from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";

import { htmlDefaultFontSize } from "@/pages/_document.page";
import { hasSeenTrigger } from "@/web/common/components/InfoDialog/infoDialogStore";
import { showInfo } from "@/web/common/components/InfoDialog/infoEvents";
import { clearNewlyAddedNode, isNodeNewlyAdded } from "@/web/common/store/ephemeralStore";
import { WorkspaceContextType } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setNodeLabel } from "@/web/topic/store/actions";

// If we had to resize, make sure the user knows that text should be concise.
const onFontResize = (textAreaId: string) => {
  // if (hasSeenTrigger("nodeTextSizeReduced")) return;

  showInfo(
    "nodeTextSizeReduced",
    `Font size has been reduced to fit your text!
    
Ideally node text is concise - a sentence fragment of just one concept, like 'Problem: cars going too fast'. But sometimes it can be hard to make the text more concise, and that's ok.`,
    `#${CSS.escape(textAreaId)}`, // `escape` because the id can start with a number, which CSS selectors aren't supposed to https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape_static#in_context_uses
  );
};

/**
 * If textarea content goes beyond its max rows, adjust font size below 1rem until text fits.
 * This should be convenient for making text easy to read without scrolling, particularly when the
 * text is barely overflowing.
 *
 * Because of performance concerns, don't do calcs when text already fits at the default font size.
 *
 * Note: The most recent benchmark for this calc was ~1-10ms on "mid-tier mobile".
 * This is a lot, likely noticeable after 10-100 nodes - this is why we display a warning when
 * first adding text that requires font resizing, so that users try to avoid it.
 *
 * Note: Tried using a `div` similar to how we do in layout.ts (because that spot found `textarea` to be slower),
 * for this calc but didn't notice a significant performance difference here (presumably the `textarea` savings
 * was for `.scrollHeight`? since it's the main thing in the layout calc).
 *
 * TODO(bug): for some reason the text area gets bigger by 2px when we have to reduce the font size,
 * but it's not very noticeable, so seems fine to leave for now.
 *
 * @returns true if text is resized, false otherwise.
 */
/* eslint-disable functional/no-let, functional/no-loop-statements, functional/immutable-data, no-param-reassign -- dom modification is easier without these */
const fitTextIntoElement = (element: HTMLTextAreaElement) => {
  // note: `getComputedStyle` seems significantly faster than `element.style.fontSize` for getting fontSize ("mid-tier mobile": 0.01ms vs 0.5ms)
  const fontIsDefaultSize = getComputedStyle(element).fontSize === `${htmlDefaultFontSize}px`;
  const textFitsAtDefaultSize = element.scrollHeight <= element.clientHeight && fontIsDefaultSize;
  if (textFitsAtDefaultSize) return false;

  let currentFontSizeRem = 1;
  element.style.fontSize = `${currentFontSizeRem}rem`; // default, don't go bigger than this

  // `alignContent: center` somehow, for some sets of text, results in a 1px increase in scrollHeight beyond MUI's
  // calculated height, e.g. scrollHeight might be 52px with clientHeight 51px when our font size
  // has actually been reduced to fit already; so subtract that 1px out to ensure we don't reduce
  // font size further than we need.
  const extraScrollPxFromAligningCenter = 1;

  while (element.scrollHeight - extraScrollPxFromAligningCenter > element.clientHeight) {
    if (currentFontSizeRem <= 12.0 / 16) break; // 12px at 16px default font size looks really small, so keep this as the minimum

    currentFontSizeRem = currentFontSizeRem - 1.0 / htmlDefaultFontSize; // try 1px smaller
    element.style.fontSize = `${currentFontSizeRem}rem`;
  }

  if (currentFontSizeRem < 1) {
    // If we adjust the font size via code, the textarea can be taller than the text in it, so this
    // ensures the text is vertically centered.
    element.style.alignContent = "center";

    return true;
  } else {
    // Somehow when we rely on `alignContent: center`, there's a 1px increase in scrollHeight beyond MUI's calculated height,
    // creating an awkward 1px scroll... so don't center if we're not reducing font size.
    element.style.alignContent = "unset";

    return false;
  }
};
/* eslint-enable functional/no-let, functional/no-loop-statements, functional/immutable-data, no-param-reassign */

interface Props {
  nodeId: string;
  nodeText: string;
  context: WorkspaceContextType;
  editable: boolean;
}

const NodeTextAreaBase = ({ nodeId, nodeText, context, editable }: Props) => {
  const [textAreaSelected, setTextAreaSelected] = useState(false);
  const [prevText, setPrevText] = useState(nodeText);

  const textAreaId = `${nodeId}-${context}-textarea`;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textAreaRef.current) return;
    fitTextIntoElement(textAreaRef.current);
  }, []);

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

  const textChanged = prevText !== nodeText;
  if (textChanged) setPrevText(nodeText);

  // e.g. on undo/redo, or if editing text in details pane and the same node is showing in the diagram
  const textChangedExternally =
    textChanged && textAreaRef.current && textAreaRef.current.value !== nodeText;

  if (textChangedExternally) {
    // eslint-disable-next-line functional/immutable-data
    textAreaRef.current.value = nodeText;
    fitTextIntoElement(textAreaRef.current);
  }

  return (
    <StyledTextareaAutosize
      id={textAreaId}
      ref={textAreaRef}
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
      onChange={(event) => {
        const resized = fitTextIntoElement(event.target);
        if (resized) onFontResize(textAreaId);
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
