import { useCurrentViewStore } from "@/web/view/currentViewStore/store";

// hooks
export const useTransposed = () => {
  return useCurrentViewStore((state) => state.transposed);
};

// actions
export const setTransposed = (value: boolean) => {
  useCurrentViewStore.setState({ transposed: value }, false, "setTransposed");
};
