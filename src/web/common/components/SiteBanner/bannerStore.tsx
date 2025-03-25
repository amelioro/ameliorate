// mainly using a store for banner state so that the landing can use conditional scroll-margin-top based on if banner is showing

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BannerStoreState {
  showBanner: boolean;
}

const initialState: BannerStoreState = {
  showBanner: false, // so we can avoid showing the banner until we check localstorage and know that we should show it
};

const persistKey = "banner-storage";

const useUserConfigStore = create<BannerStoreState>()(
  persist(() => initialState, {
    name: persistKey,
    skipHydration: true, // so we can avoid showing the banner until we check localstorage and know that we should show it
  }),
);

// hooks
export const useShowBanner = () => {
  return useUserConfigStore((state) => state.showBanner);
};

// actions
export const initializeBanner = async () => {
  if (useUserConfigStore.persist.getOptions().storage?.getItem(persistKey)) {
    await useUserConfigStore.persist.rehydrate();
  } else {
    useUserConfigStore.setState({ showBanner: true });
  }
};

export const hideBanner = () => {
  useUserConfigStore.setState({ showBanner: false });
};
