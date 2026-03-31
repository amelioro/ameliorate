import { create } from "zustand";
import { persist } from "zustand/middleware";

import { migrate } from "@/web/view/userConfigStore/migrate";

type WhenToShowIndicators = "always" | "onHoverOrSelect";

interface UserConfigStoreState {
  zenMode: boolean;
  fillNodesWithColor: boolean;
  /**
   * Have this because there's visual conflict with scores, but it can be nice sometimes to have the
   * hint of which node types are hidden.
   *
   * Default off because the dashed border is nice for conveying "hidden" but that doesn't work very
   * well when the attachment is filled with color.
   *
   * We'll want to keep an eye on this to see if on/off feels best; ideally we wouldn't have to have
   * a config for this.
   */
  fillNodeAttachmentWithColor: boolean;
  expandDetailsTabs: boolean;
  /**
   * When true, show score pies by hovering rather than just via click. Can be nice to score many
   * nodes quickly on desktop. Don't want this on all the time because it's pretty annoying for
   * pies to show when you're not intending to set scores.
   */
  quickScoring: boolean;

  whenToShowIndicators: WhenToShowIndicators;

  enableScoresToShow: boolean;
  enableContentIndicators: boolean;
  enableViewIndicators: boolean;
  enableForceShownIndicators: boolean;

  /**
   * When true, edge arrows use distinct logic-gate shapes per edge type (AND, NOT, OR gates).
   * When false (default), all edges use a simple triangle (buffer gate) arrow.
   *
   * Defaulted off because it may make things less clear for new users. I wanted the option so I can
   * see how it feels. It might allow us to hide the edge label and therefore reduce clutter a bit,
   * though we aren't doing that quite yet.
   */
  enableSemanticArrowShapes: boolean;
}

const initialState: UserConfigStoreState = {
  zenMode: false,
  fillNodesWithColor: false,
  fillNodeAttachmentWithColor: false,
  expandDetailsTabs: true,
  quickScoring: false,

  whenToShowIndicators: "onHoverOrSelect",
  enableScoresToShow: true,
  enableContentIndicators: true,
  enableViewIndicators: false,
  enableForceShownIndicators: false,

  enableSemanticArrowShapes: false,
};

const useUserConfigStore = create<UserConfigStoreState>()(
  persist(() => initialState, {
    name: "user-config-storage",
    version: 3,
    migrate: migrate,
  }),
);

// hooks
export const useZenMode = () => {
  return useUserConfigStore((state) => state.zenMode);
};

export const useFillNodesWithColor = () => {
  return useUserConfigStore((state) => state.fillNodesWithColor);
};

export const useFillNodeAttachmentWithColor = () => {
  return useUserConfigStore((state) => state.fillNodeAttachmentWithColor);
};

export const useExpandDetailsTabs = () => {
  return useUserConfigStore((state) => state.expandDetailsTabs);
};

export const useQuickScoring = () => {
  return useUserConfigStore((state) => state.quickScoring);
};

export const useWhenToShowIndicators = () => {
  return useUserConfigStore((state) => state.whenToShowIndicators);
};

export const useEnableScoresToShow = () => {
  return useUserConfigStore((state) => state.enableScoresToShow);
};

export const useEnableContentIndicators = () => {
  return useUserConfigStore((state) => state.enableContentIndicators);
};

export const useEnableViewIndicators = () => {
  return useUserConfigStore((state) => state.enableViewIndicators);
};

export const useEnableForceShownIndicators = () => {
  return useUserConfigStore((state) => state.enableForceShownIndicators);
};

export const useEnableSemanticArrowShapes = () => {
  return useUserConfigStore((state) => state.enableSemanticArrowShapes);
};

// actions
export const toggleZenMode = () => {
  useUserConfigStore.setState((state) => ({ zenMode: !state.zenMode }));
};

export const toggleFillNodesWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodesWithColor: fill });
};

export const toggleFillNodeAttachmentWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodeAttachmentWithColor: fill });
};

export const toggleExpandDetailsTabs = () => {
  useUserConfigStore.setState((state) => ({ expandDetailsTabs: !state.expandDetailsTabs }));
};

export const toggleQuickScoring = () => {
  useUserConfigStore.setState((state) => ({ quickScoring: !state.quickScoring }));
};

export const setWhenToShowIndicators = (whenToShowIndicators: WhenToShowIndicators) => {
  useUserConfigStore.setState({ whenToShowIndicators });
};

export const toggleEnableScoresToShow = () => {
  useUserConfigStore.setState((state) => ({ enableScoresToShow: !state.enableScoresToShow }));
};

export const toggleEnableContentIndicators = () => {
  useUserConfigStore.setState((state) => ({
    enableContentIndicators: !state.enableContentIndicators,
  }));
};

export const toggleEnableViewIndicators = () => {
  useUserConfigStore.setState((state) => ({ enableViewIndicators: !state.enableViewIndicators }));
};

export const toggleEnableForceShownIndicators = () => {
  useUserConfigStore.setState((state) => ({
    enableForceShownIndicators: !state.enableForceShownIndicators,
  }));
};

export const toggleEnableSemanticArrowShapes = () => {
  useUserConfigStore.setState((state) => ({
    enableSemanticArrowShapes: !state.enableSemanticArrowShapes,
  }));
};
