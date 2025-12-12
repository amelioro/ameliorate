import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  zenMode: boolean;
  fillNodesWithColor: boolean;
  /**
   * Have this because there's visual conflict with scores, but it can be nice sometimes to have the
   * hint of which node types are hidden.
   *
   * Default on, assuming that we'll default "show scores" to on-hover/select so there isn't as much
   * visual conflict.
   *
   * We'll want to keep an eye on this to see if on/off feels best; ideally we wouldn't have to have
   * a config for this.
   */
  fillNodeAttachmentWithColor: boolean;
  expandDetailsTabs: boolean;
  /**
   * Use a group of AddNodeButtons instead of a menu.
   *
   * Menu is clearer and more friendly for beginners. Keeping the buttons around for power users in
   * case it seems very convenient to have quicker ways to add nodes. Might remove the option to
   * expand buttons if that doesn't seem very worthwhile.
   */
  expandAddNodeButtons: boolean;
  /**
   * When true, show score pies by hovering rather than just via click. Can be nice to score many
   * nodes quickly on desktop. Don't want this on all the time because it's pretty annoying for
   * pies to show when you're not intending to set scores.
   */
  quickScoring: boolean;

  showScores: boolean;
  showContentIndicators: boolean;
  showViewIndicators: boolean;
  indicateWhenNodeForcedToShow: boolean; // legacy name, could rename to `showForceShownIndicators`
}

const initialState: UserConfigStoreState = {
  zenMode: false,
  fillNodesWithColor: false,
  fillNodeAttachmentWithColor: true,
  expandDetailsTabs: true,
  expandAddNodeButtons: false,
  quickScoring: false,

  showScores: true,
  showContentIndicators: true,
  showViewIndicators: false,
  indicateWhenNodeForcedToShow: false,
};

const useUserConfigStore = create<UserConfigStoreState>()(
  persist(() => initialState, {
    name: "user-config-storage",
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

export const useExpandAddNodeButtons = () => {
  return useUserConfigStore((state) => state.expandAddNodeButtons);
};

export const useQuickScoring = () => {
  return useUserConfigStore((state) => state.quickScoring);
};

export const useShowScores = () => {
  return useUserConfigStore((state) => state.showScores);
};

export const useShowContentIndicators = () => {
  return useUserConfigStore((state) => state.showContentIndicators);
};

export const useShowViewIndicators = () => {
  return useUserConfigStore((state) => state.showViewIndicators);
};

export const useIndicateWhenNodeForcedToShow = () => {
  return useUserConfigStore((state) => state.indicateWhenNodeForcedToShow);
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

export const toggleExpandAddNodeButtons = () => {
  useUserConfigStore.setState((state) => ({ expandAddNodeButtons: !state.expandAddNodeButtons }));
};

export const toggleQuickScoring = () => {
  useUserConfigStore.setState((state) => ({ quickScoring: !state.quickScoring }));
};

export const toggleShowScores = () => {
  useUserConfigStore.setState((state) => ({ showScores: !state.showScores }));
};

export const toggleShowContentIndicators = () => {
  useUserConfigStore.setState((state) => ({ showContentIndicators: !state.showContentIndicators }));
};

export const toggleShowViewIndicators = () => {
  useUserConfigStore.setState((state) => ({ showViewIndicators: !state.showViewIndicators }));
};

export const toggleIndicateWhenNodeForcedToShow = () => {
  useUserConfigStore.setState((state) => ({
    indicateWhenNodeForcedToShow: !state.indicateWhenNodeForcedToShow,
  }));
};
