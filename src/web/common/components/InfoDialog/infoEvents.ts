import { createNanoEvents } from "nanoevents";
import { ReactNode } from "react";

import { setInfoShown } from "@/web/common/components/InfoDialog/infoDialogStore";

export type Trigger =
  | "nodeTextSizeReduced"
  | "invalidCustomNodeType"
  | "invalidCustomEdgeLabel"
  | "changesFailedToSave";

export type InfoType = "error" | "warning" | "info";
export type Anchor = string | HTMLElement;

interface Events {
  infoToShow: (infoType: InfoType, message: ReactNode, anchor?: Anchor) => void;
}

export const emitter = createNanoEvents<Events>();

/**
 * If no anchor is provided, dialog will be centered on the screen.
 */
export const showInfo = (trigger: Trigger, message: ReactNode, anchor?: Anchor) => {
  emitter.emit("infoToShow", "info", message, anchor);
  setInfoShown(trigger);
};

/**
 * If no anchor is provided, dialog will be centered on the screen.
 */
export const showWarning = (trigger: Trigger, message: ReactNode, anchor?: Anchor) => {
  emitter.emit("infoToShow", "warning", message, anchor);
  setInfoShown(trigger);
};

/**
 * If no anchor is provided, dialog will be centered on the screen.
 */
export const showError = (trigger: Trigger, message: ReactNode, anchor?: Anchor) => {
  emitter.emit("infoToShow", "error", message, anchor);
  setInfoShown(trigger);
};
