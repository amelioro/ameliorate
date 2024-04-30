import { create } from "zustand";

interface PaneStoreState {
  isTopicPaneOpen: boolean;
  selectedTab: "Details" | "Views";
}

const initialState: PaneStoreState = {
  isTopicPaneOpen: true,
  selectedTab: "Details",
};

export const usePaneStore = create<PaneStoreState>()(() => initialState);

export const setIsTopicPaneOpen = (isTopicPaneOpen: boolean) => {
  usePaneStore.setState({ isTopicPaneOpen });
};

export const setSelectedTab = (selectedTab: "Details" | "Views") => {
  usePaneStore.setState({ selectedTab });
};

export const viewDetails = () => {
  setIsTopicPaneOpen(true);
  setSelectedTab("Details");
};
