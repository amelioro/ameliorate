/**
 * Logic related to loading/unloading stores.
 *
 * Intended to be cross-module e.g. load/unload topic store, view store, with intent that `/web/topic`
 * might become a cross-module place for topic-related things (and the current `topic` verbiage as in
 * `TopicStore` can be reworded to something more narrow).
 */

import fileDownload from "js-file-download";
import shortUUID from "short-uuid";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "@/common/errorHandling";
import {
  loadCommentsFromApi,
  loadCommentsFromLocalStorage,
} from "@/web/comment/store/commentStore";
import { loadDraftsFromLocalStorage } from "@/web/comment/store/draftStore";
import {
  populateDiagramFromApi,
  populateDiagramFromLocalStorage,
} from "@/web/topic/store/loadActions";
import { migrate } from "@/web/topic/store/migrate";
import { TopicStoreState } from "@/web/topic/store/store";
import { getPersistState, setTopicData } from "@/web/topic/store/utilActions";
import { getTopicTitle } from "@/web/topic/store/utils";
import { TopicData } from "@/web/topic/utils/apiConversion";
import { loadActionConfig } from "@/web/view/actionConfigStore";
import { loadView } from "@/web/view/currentViewStore/store";
import { loadMiscTopicConfig } from "@/web/view/miscTopicConfigStore";
import {
  QuickView,
  QuickViewStoreState,
  currentVersion as currentViewsVersion,
  getPersistState as getViewsPersistState,
  initialStateWithBasicViews,
  loadQuickViewsFromApi,
  loadQuickViewsFromDownloaded,
  loadQuickViewsFromLocalStorage,
} from "@/web/view/quickViewStore/store";

const oldDownloadSchema1 = z.object({
  state: z.record(z.any()),
  version: z.number(),
});

const downloadJsonSchema = z.preprocess(
  (val) => {
    if (oldDownloadSchema1.safeParse(val).success) {
      return {
        topic: val,
        views: { state: initialStateWithBasicViews(), version: currentViewsVersion },
      };
    } else return val;
  },
  z.object({
    topic: z.object({
      state: z.record(z.any()), // z.record() because without it will result in optional `state`, see https://github.com/colinhacks/zod/issues/1628
      version: z.number(),
    }),
    views: z.object({
      state: z.record(z.any()),
      version: z.number(),
    }),
  })
);

interface DownloadJson {
  topic: StorageValue<TopicStoreState>;
  views: StorageValue<QuickViewStoreState>;
}

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
export const downloadTopic = () => {
  const topicPersistState = getPersistState();
  const viewsPersistState = getViewsPersistState();

  const topicState = topicPersistState.state;
  const topicTitle = getTopicTitle(topicState);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137

  const downloadJson = { topic: topicPersistState, views: viewsPersistState };

  fileDownload(JSON.stringify(downloadJson), `${sanitizedFileName}.json`);
};

/**
 * Generate new ids for nodes, edges, and views to avoid conflicts with the topic that this was downloaded
 * from.
 *
 * Also, ensure that related scores, claims, edges, and views are updated accordingly.
 */
const ensureUnique = (
  topicStoreState: TopicStoreState,
  quickViewStoreState: QuickViewStoreState
) => {
  const { nodes, edges } = topicStoreState;
  const { views } = quickViewStoreState;

  // much easier to ensure all uuids are replaced this way, rather than replacing uuids for each specifically-relevant property
  // eslint-disable-next-line functional/no-let
  let stringifiedTopic = JSON.stringify(topicStoreState);
  // eslint-disable-next-line functional/no-let
  let stringifiedViews = JSON.stringify(quickViewStoreState);

  [...nodes, ...edges].forEach((graphPart) => {
    const newId = uuid();

    stringifiedTopic = stringifiedTopic.replace(new RegExp(graphPart.id, "g"), newId);
    stringifiedViews = stringifiedViews.replace(new RegExp(graphPart.id, "g"), newId);
  });

  views.forEach((view) => {
    const newId = shortUUID.generate();

    // topic shouldn't point to any view ids
    stringifiedViews = stringifiedViews.replace(new RegExp(view.id, "g"), newId);
  });

  return {
    uniqueTopic: JSON.parse(stringifiedTopic) as TopicStoreState,
    uniqueViews: JSON.parse(stringifiedViews) as QuickViewStoreState,
  };
};

export const uploadTopic = (
  event: React.ChangeEvent<HTMLInputElement>,
  sessionUsername?: string
) => {
  if (event.target.files === null) return;

  const file = event.target.files[0];
  if (!file) return;

  file
    .text()
    .then((text) => {
      const downloadJson = downloadJsonSchema.parse(JSON.parse(text)) as DownloadJson;

      // migrations
      const topicPersistState = downloadJson.topic;
      if (!topicPersistState.version) {
        throw errorWithData(
          "No version found in file, cannot migrate old state",
          topicPersistState
        );
      }
      const migratedTopicState = migrate(
        topicPersistState.state,
        topicPersistState.version
      ) as TopicStoreState;

      const viewsPersistState = downloadJson.views;
      const migratedViewsState = viewsPersistState.state; // TODO: migrate when quick views have migrations

      // avoid conflicts with existing topics
      const { uniqueTopic, uniqueViews } = ensureUnique(migratedTopicState, migratedViewsState);

      // populate stores
      setTopicData(uniqueTopic, sessionUsername);
      loadQuickViewsFromDownloaded(uniqueViews);
    })
    .catch((error: unknown) => {
      throw error;
    });
};

export const loadStores = async (diagramData?: TopicData) => {
  const onPlayground = diagramData === undefined;

  // might be cleaner to have one `load` interface per store, that knows to use passed-in data vs storage?
  if (onPlayground) {
    await populateDiagramFromLocalStorage();
    await loadQuickViewsFromLocalStorage();
    await loadView("playground");
    await loadActionConfig("playground");
    await loadMiscTopicConfig("playground");
    await loadCommentsFromLocalStorage();
    await loadDraftsFromLocalStorage();
  } else {
    populateDiagramFromApi(diagramData);
    loadQuickViewsFromApi(diagramData, diagramData.views as unknown as QuickView[]); // unknown cast is awkward but need until the viewState is shared with backend
    await loadView(`${diagramData.creatorName}/${diagramData.title}`);
    await loadActionConfig(`${diagramData.creatorName}/${diagramData.title}`);
    await loadMiscTopicConfig(`${diagramData.creatorName}/${diagramData.title}`);
    loadCommentsFromApi(diagramData, diagramData.comments);
    await loadDraftsFromLocalStorage(`${diagramData.creatorName}/${diagramData.title}`);
  }
};
