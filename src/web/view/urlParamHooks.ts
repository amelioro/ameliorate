import { jsonrepair } from "jsonrepair";
import { useSearchParams } from "next/navigation";
import Router from "next/router";
import { useEffect, useState } from "react";
import { validate as uuidValidate } from "uuid";
import { ZodSchema } from "zod";

import { tryOrNull } from "../../common/errorHandling";
import { useTopicStore } from "../topic/store/store";
import {
  NavigateStoreState,
  initialState,
  setFormat,
  setGeneralFilter,
  setSelected,
  setShowInformation,
  setStandardFilter,
  setTableFilter,
  useNavigateStore,
} from "./navigateStore";
import { standardFilterSchema } from "./utils/diagramFilter";
import { generalFilterSchema } from "./utils/generalFilter";
import { tableFilterSchema } from "./utils/tableFilter";

const findGraphPartIdBySubstring = (graphPartIdSubstring: string | null) => {
  if (!graphPartIdSubstring) return null;

  const state = useTopicStore.getState();

  const graphPart =
    state.nodes.find((node) => node.id.startsWith(graphPartIdSubstring)) ??
    state.edges.find((edge) => edge.id.startsWith(graphPartIdSubstring));

  return graphPart?.id ?? null;
};

/**
 * Used for search params to keep them short and readable.
 */
const trimPartId = (partId: string) => {
  return partId.substring(0, trimmedUuidLength);
};

/**
 * Using the first 8 chars, 10000 guids have 1% probability collision.
 * This seems reasonable; most topics will have a number of graph parts in the 100s.
 */
const trimmedUuidLength = 8;

const untrimPartId = (trimmedPartId: string) => {
  const fullGraphPartId = findGraphPartIdBySubstring(trimmedPartId);
  if (fullGraphPartId) return fullGraphPartId;

  return trimmedPartId;
};

/**
 * Looks for trimmed uuids, tries to find their associated graph part, and use that to restore the full uuid.
 *
 * Does not work if json has nested objects.
 */
const untrimAllUuids = (json: object) => {
  const untrimmedJson: Record<string, unknown> = {};

  /* eslint-disable functional/immutable-data */
  Object.entries(json).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      untrimmedJson[key] = value.map((v) => {
        if (typeof v !== "string" || v.length !== trimmedUuidLength) return v as object;
        return untrimPartId(v);
      });
    } else if (String(value).length === trimmedUuidLength) {
      // convert value to String before checking length because if it's 8 digits, it could be typed as a number
      untrimmedJson[key] = untrimPartId(String(value));
    } else untrimmedJson[key] = value;
  });
  /* eslint-enable functional/immutable-data */

  return untrimmedJson;
};

/**
 * Looks for all uuids in the json and trims them.
 *
 * Does not work if json has nested objects.
 */
const trimAllUuids = (json: object) => {
  const trimmedJson: Record<string, unknown> = {};

  /* eslint-disable functional/immutable-data */
  Object.entries(json).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      trimmedJson[key] = value.map((v) =>
        typeof v === "string" && uuidValidate(v) ? trimPartId(v) : (v as object)
      );
    } else if (typeof value === "string" && uuidValidate(value)) {
      trimmedJson[key] = trimPartId(value);
    } else trimmedJson[key] = value;
  });
  /* eslint-enable functional/immutable-data */

  return trimmedJson;
};

const getFilterFromParamsString = <TFilter extends object>(
  paramsString: string,
  filterSchema: ZodSchema<TFilter>
): TFilter | null => {
  const paramsWithBracesRestored = paramsString.replace(/\(/g, "{").replace(/\)/g, "}");

  const restoredJsonString = tryOrNull(() => jsonrepair(paramsWithBracesRestored)); // restore quotes
  if (!restoredJsonString) return null;

  const restoredJson = JSON.parse(restoredJsonString) as object;
  const restoredJsonWithUuids = untrimAllUuids(restoredJson);

  const parsedFilter = filterSchema.safeParse(restoredJsonWithUuids);

  return parsedFilter.success ? parsedFilter.data : null;
};

const getFilterAsParamsString = <TFilter extends object>(
  filter: TFilter,
  filterSchema: ZodSchema<TFilter>
) => {
  const parsedFilter = filterSchema.parse(filter);

  const trimmedFilter = trimAllUuids(parsedFilter);

  // chrome doesn't handle quotes and curly braces well when clicking on a link that has them in the params
  const niceForURL = JSON.stringify(trimmedFilter)
    .replace(/"/g, "")
    .replace(/{/g, "(")
    .replace(/}/g, ")");

  return niceForURL;
};

const processSearchParams = (searchParams: URLSearchParams) => {
  const selectedGraphPartIdSubstring = searchParams.get("selected")?.toLowerCase() ?? null;
  const selectedGraphPartId = findGraphPartIdBySubstring(selectedGraphPartIdSubstring);
  setSelected(selectedGraphPartId);

  const structureString = searchParams.get("structure") ?? "";
  if (structureString === "off") setShowInformation("structure", false);
  else {
    const structureFilter = getFilterFromParamsString(structureString, standardFilterSchema);
    if (structureFilter) setStandardFilter("structure", structureFilter);
  }

  const researchString = searchParams.get("research") ?? "";
  const researchFilter = getFilterFromParamsString(researchString, standardFilterSchema);
  if (researchFilter) setStandardFilter("research", researchFilter);

  const justificationString = searchParams.get("justification") ?? "{}";
  const justificationFilter = getFilterFromParamsString(justificationString, standardFilterSchema);
  if (justificationFilter) setStandardFilter("justification", justificationFilter);

  const tableString = searchParams.get("table") ?? "{}";
  const tableFilter = getFilterFromParamsString(tableString, tableFilterSchema);
  if (tableFilter) {
    setFormat("table");
    setTableFilter(tableFilter);
  }

  const generalString = searchParams.get("general") ?? "{}";
  const generalFilter = getFilterFromParamsString(generalString, generalFilterSchema);
  if (generalFilter) setGeneralFilter(generalFilter);
};

const getCalculatedSearchParams = (state: NavigateStoreState) => {
  const params = new URLSearchParams();

  const selected = state.selectedGraphPartId ? trimPartId(state.selectedGraphPartId) : "";
  if (selected) params.append("selected", selected);

  if (state.format === "diagram") {
    const structure =
      // Check type here because structure is on by default, and we want to exclude from URL if it's the default still.
      // Use "off" as value if structure is off, in order to distinguish from the default.
      state.categoriesToShow.includes("structure") && state.structureFilter.type !== "none"
        ? getFilterAsParamsString(state.structureFilter, standardFilterSchema)
        : !state.categoriesToShow.includes("structure")
        ? "off"
        : "";

    const research = state.categoriesToShow.includes("research")
      ? getFilterAsParamsString(state.researchFilter, standardFilterSchema)
      : "";

    const justification = state.categoriesToShow.includes("justification")
      ? getFilterAsParamsString(state.justificationFilter, standardFilterSchema)
      : "";

    if (structure) params.append("structure", structure);
    if (research) params.append("research", research);
    if (justification) params.append("justification", justification);
  } else {
    const table = getFilterAsParamsString(state.tableFilter, tableFilterSchema);
    params.append("table", table);
  }

  if (JSON.stringify(state.generalFilter) !== JSON.stringify(initialState.generalFilter)) {
    const general = getFilterAsParamsString(state.generalFilter, generalFilterSchema);
    params.append("general", general);
  }

  return params;
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

const calculatedParamOptions = [
  "selected",
  "structure",
  "research",
  "justification",
  "table",
  "general",
];

const getNewSearchParamsString = (
  calculatedSearchParams: URLSearchParams,
  oldUrlSearchParams: URLSearchParams
) => {
  const newUrlSearchParams = new URLSearchParams(calculatedSearchParams.toString());

  // retain params that aren't calculated
  oldUrlSearchParams.forEach((value, key) => {
    if (!calculatedParamOptions.includes(key)) newUrlSearchParams.append(key, value);
  });

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
 * means we need to be able to search the topic store for graph part ids, which means we need to
 * start syncing after the topic store is loaded.
 */
export const useSyncSearchParamsWithStore = (topicDiagramInitiallyLoaded: boolean) => {
  // TODO?: can we avoid using hooks for these? seems more complex than it needs to, and there should be no possibility of infinite loop.
  // e.g. replace hook to update store with a function that's triggered on page refresh or forward/back navigate
  // and replace hook to update URL with a function that's triggered when store changes (probably custom store middleware like `apiSyncerMiddleware`)
  useUpdateStoreFromSearchParams(topicDiagramInitiallyLoaded);
  useUpdateSearchParamsFromStore(topicDiagramInitiallyLoaded);
};
