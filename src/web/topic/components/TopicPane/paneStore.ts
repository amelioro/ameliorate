import { create } from "zustand";
import React from "react";

interface PaneStoreState {
  isTopicPaneOpen: boolean;
  selectedTab: "Details" | "Views";
  isDetailsOpen: boolean;
  isViewsOpen: boolean;
}

const initialState: PaneStoreState = {
  isTopicPaneOpen: true,
  selectedTab: "Details",
  isDetailsOpen: true,
  isViewsOpen: false,
};

export const usePaneStore = create<PaneStoreState>()(() => initialState);

export const setIsTopicPaneOpen = (isTopicPaneOpen: boolean) => {
  usePaneStore.setState({ isTopicPaneOpen });
};

export const setSelectedTab = (selectedTab: "Details" | "Views") => {
  usePaneStore.setState({ selectedTab });
};

export const setIsDetailsOpen = (isDetailsOpen: boolean) => {
  usePaneStore.setState({ isDetailsOpen });
  if (isDetailsOpen) {
    usePaneStore.setState({
      selectedTab: "Details",
    });
  }
};

export const setIsViewsOpen = (isViewsOpen: boolean) => {
  usePaneStore.setState({
    isViewsOpen,
  });
  if (isViewsOpen) {
    usePaneStore.setState({
      selectedTab: "Views",
    });
  }
};

export const viewDetails = () => {
  setIsTopicPaneOpen(true);
  setSelectedTab("Details");
};

export const useViewportWidth = (): number => {
  const [value, setValue] = React.useState<number>(window.innerWidth);

  const resizeEvent = () => {
    setValue(window.innerWidth);
  };

  React.useEffect(() => {
    addEventListener("resize", resizeEvent);
    return () => {
      removeEventListener("resize", resizeEvent);
    };
  }, [resizeEvent]);

  return value;
};
