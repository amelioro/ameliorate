import { nodeWidthRem } from "@/web/topic/components/Node/EditableNode.styles";

const drawerPaddingRem = 0.5;
const drawerScrollbarWidthRem = 1; // make container big enough to hold both nodes even with scrollbar showing
export const drawerMinWidthRem = nodeWidthRem * 2 + drawerPaddingRem + drawerScrollbarWidthRem;
