import { useSearchParams } from "next/navigation";
import Router from "next/router";
import { useEffect, useState } from "react";

import { zFormats } from "../../common/infoCategory";
import { useTopicStore } from "../topic/store/store";
import {
  NavigateStoreState,
  initialState,
  setFormat,
  setSelected,
  useNavigateStore,
} from "./navigateStore";

const findGraphPartIdBySubstring = (graphPartIdSubstring: string | null) => {
  if (!graphPartIdSubstring) return null;

  const state = useTopicStore.getState();

  const graphPart =
    state.nodes.find((node) => node.id.startsWith(graphPartIdSubstring)) ??
    state.edges.find((edge) => edge.id.startsWith(graphPartIdSubstring));

  return graphPart?.id ?? null;
};

const processSearchParams = (searchParams: URLSearchParams) => {
  const selectedGraphPartIdSubstring = searchParams.get("selected")?.toLowerCase() ?? null;
  const selectedGraphPartId = findGraphPartIdBySubstring(selectedGraphPartIdSubstring);
  setSelected(selectedGraphPartId);

  const parsedFormat = zFormats.safeParse(searchParams.get("format")?.toLowerCase());
  if (parsedFormat.success) {
    setFormat(parsedFormat.data);
  } else {
    setFormat("diagram"); // default
  }
};

/**
 * Used for search params to keep them short and readable.
 */
const trimPartId = (partId: string) => {
  // Using the first 8 chars, 10000 guids have 1% probability collision
  // This seems reasonable; most topics will have a number of graph parts in the 100s
  return partId.substring(0, 8);
};

const getCalculatedSearchParams = (state: NavigateStoreState) => {
  const selectedParam = state.selectedGraphPartId
    ? `selected=${trimPartId(state.selectedGraphPartId)}`
    : "";

  const formatParam = state.format !== initialState.format ? `format=${state.format}` : "";

  return new URLSearchParams([selectedParam, formatParam].join("&"));
};

const useCalculatedSearchParams = () => {
  return useNavigateStore(
    (state) => getCalculatedSearchParams(state),
    (a, b) => {
      return a.toString() === b.toString();
    }
  );
};

const useUpdateStoreFromSearchParams = (topicDiagramInitiallyLoaded: boolean) => {
  const readonlyUrlSearchParams = useSearchParams();

  // has to be in useEffect because can trigger render of other components
  useEffect(() => {
    // `useSearchParams` was fixed to exclude path params in next 13.4.20-canary.37 https://github.com/vercel/next.js/pull/55280
    // but netlify doesn't support next versions beyond 13.4.19 https://answers.netlify.com/t/runtime-importmoduleerror-error-cannot-find-module-styled-jsx-style/102375/28
    const urlSearchParams = new URLSearchParams(readonlyUrlSearchParams);
    urlSearchParams.delete("username");
    urlSearchParams.delete("topicTitle");

    const calculatedSearchParams = getCalculatedSearchParams(useNavigateStore.getState());
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    processSearchParams(urlSearchParams);
  }, [readonlyUrlSearchParams, topicDiagramInitiallyLoaded]);
};

const getNewSearchParamsString = (
  calculatedSearchParams: URLSearchParams,
  oldUrlSearchParams: URLSearchParams
) => {
  const newUrlSearchParams = new URLSearchParams(oldUrlSearchParams.toString());

  const format = calculatedSearchParams.get("format");
  if (format) newUrlSearchParams.set("format", format);
  else newUrlSearchParams.delete("format");

  const selected = calculatedSearchParams.get("selected");
  if (selected) newUrlSearchParams.set("selected", selected);
  else newUrlSearchParams.delete("selected"); // annoying that setting no value doesn't do this

  const searchParamsString = newUrlSearchParams.toString()
    ? // decode to allow `:` in params; this should be ok https://stackoverflow.com/a/5330261/8409296
      `?${decodeURIComponent(newUrlSearchParams.toString())}`
    : "";

  return searchParamsString;
};

const useUpdateSearchParamsFromStore = (topicDiagramInitiallyLoaded: boolean) => {
  const calculatedSearchParams = useCalculatedSearchParams();
  const [oldCalculatedParams, setOldCalculatedParams] = useState(calculatedSearchParams);

  // useEffect so that Router exists; maybe also necessary to setOldCalculatedParams without optimizing and skipping over the rest
  useEffect(() => {
    const calculatedParamsChanged =
      calculatedSearchParams.toString() !== oldCalculatedParams.toString();
    if (!calculatedParamsChanged) return; // other things could trigger this hook, but we don't care about those

    setOldCalculatedParams(calculatedSearchParams);

    const [pathWithoutSearchParams, urlSearchParamsString] = Router.asPath.split("?");
    const urlSearchParams = new URLSearchParams(urlSearchParamsString);
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    const searchParamsString = getNewSearchParamsString(calculatedSearchParams, urlSearchParams);
    const newPath = pathWithoutSearchParams + searchParamsString;

    void Router.push(newPath, undefined);
  }, [calculatedSearchParams, oldCalculatedParams, topicDiagramInitiallyLoaded]);
};

/**
 * Update the store when URL search params change, and vice versa.
 *
 * Infinite loops should be prevented because both sides return if store params == URL params.
 *
 * @param topicDiagramInitiallyLoaded we want to be able to use a substring for graph part ids, which
 * means we need to be able to search the topic store for graph part ids, which meanas we need to
 * start syncing after the topic store is loaded.
 */
export const useSyncSearchParamsWithStore = (topicDiagramInitiallyLoaded: boolean) => {
  useUpdateStoreFromSearchParams(topicDiagramInitiallyLoaded);
  useUpdateSearchParamsFromStore(topicDiagramInitiallyLoaded);
};
