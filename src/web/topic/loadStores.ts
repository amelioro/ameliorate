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
  viewComment,
} from "@/web/comment/store/commentStore";
import { loadDraftsFromLocalStorage } from "@/web/comment/store/draftStore";
import {
  populateDiagramFromApi,
  populateDiagramFromLocalStorage,
} from "@/web/topic/diagramStore/loadActions";
import { migrate } from "@/web/topic/diagramStore/migrate";
import { DiagramStoreState } from "@/web/topic/diagramStore/store";
import { getPersistState, setDiagramData } from "@/web/topic/diagramStore/utilActions";
import { getTopicTitleFromNodes } from "@/web/topic/diagramStore/utils";
import { migrate as migrateTopic } from "@/web/topic/topicStore/migrate";
import {
  TopicStoreState,
  getPersistState as getTopicPersistState,
  loadTopicFromApi,
  loadTopicFromLocalStorage,
  setTopicDetails,
} from "@/web/topic/topicStore/store";
import { TopicData } from "@/web/topic/utils/apiConversion";
import { isPlaygroundTopic } from "@/web/topic/utils/topic";
import { loadActionConfig } from "@/web/view/actionConfigStore";
import { loadView } from "@/web/view/currentViewStore/store";
import { loadMiscTopicConfig } from "@/web/view/miscTopicConfigStore";
import { migrate as migrateQuickView } from "@/web/view/quickViewStore/migrate";
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
  state: z
    .object({
      topic: z.record(z.any()),
    })
    .and(z.record(z.any())),
  version: z.number(),
});

const oldDownloadSchema2 = z.object({
  topic: z.object({
    state: z
      .object({
        topic: z.record(z.any()),
      })
      .and(z.record(z.any())), // z.record() because without it will result in optional `state`, see https://github.com/colinhacks/zod/issues/1628
    version: z.number(),
  }),
  views: z.object({
    state: z.record(z.any()),
    version: z.number(),
  }),
});

const downloadJsonSchema = z.preprocess(
  (val) => {
    const parsedSchema1 = oldDownloadSchema1.safeParse(val);
    if (parsedSchema1.success) {
      return {
        topic: { state: { topic: parsedSchema1.data.state.topic }, version: 1 },
        diagram: parsedSchema1.data,
        views: { state: initialStateWithBasicViews(), version: currentViewsVersion },
      };
    }

    const parsedSchema2 = oldDownloadSchema2.safeParse(val);
    if (parsedSchema2.success) {
      return {
        topic: { state: { topic: parsedSchema2.data.topic.state.topic }, version: 1 },
        diagram: parsedSchema2.data.topic,
        views: parsedSchema2.data.views,
      };
    }

    return val;
  },
  z.object({
    topic: z.object({
      state: z.object({ topic: z.record(z.any()) }), // z.record() because without it will result in optional `state`, see https://github.com/colinhacks/zod/issues/1628
      version: z.number(),
    }),
    diagram: z.object({
      state: z.record(z.any()),
      version: z.number(),
    }),
    views: z.object({
      state: z.record(z.any()),
      version: z.number(),
    }),
  }),
);

interface DownloadJson {
  topic: StorageValue<TopicStoreState>;
  diagram: StorageValue<DiagramStoreState>;
  views: StorageValue<QuickViewStoreState>;
}

export const downloadTopic = () => {
  const topicPersistState = getTopicPersistState();
  const diagramPersistState = getPersistState();
  const viewsPersistState = getViewsPersistState();

  const topic = topicPersistState.state.topic;
  const topicTitle = !isPlaygroundTopic(topic)
    ? topic.title
    : getTopicTitleFromNodes(diagramPersistState.state);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137

  const downloadJson = {
    topic: topicPersistState,
    diagram: diagramPersistState,
    views: viewsPersistState,
  };

  fileDownload(JSON.stringify(downloadJson), `${sanitizedFileName}.json`);
};

/**
 * Generate new ids for nodes, edges, and views to avoid conflicts with the topic that this was downloaded
 * from.
 *
 * Also, ensure that related scores, justifications, edges, and views are updated accordingly.
 */
const ensureUnique = (
  diagramStoreState: DiagramStoreState,
  quickViewStoreState: QuickViewStoreState,
) => {
  const { nodes, edges } = diagramStoreState;
  const { views } = quickViewStoreState;

  // much easier to ensure all uuids are replaced this way, rather than replacing uuids for each specifically-relevant property
  // eslint-disable-next-line functional/no-let
  let stringifiedTopic = JSON.stringify(diagramStoreState);
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
    uniqueDiagram: JSON.parse(stringifiedTopic) as DiagramStoreState,
    uniqueViews: JSON.parse(stringifiedViews) as QuickViewStoreState,
  };
};

export const uploadTopic = (
  event: React.ChangeEvent<HTMLInputElement>,
  sessionUsername?: string,
) => {
  if (event.target.files === null) return;

  const file = event.target.files[0];
  if (!file) return;

  file
    .text()
    .then((text) => {
      const downloadJson = downloadJsonSchema.parse(JSON.parse(text)) as DownloadJson;

      // migrations
      const diagramPersistState = downloadJson.diagram;
      if (!diagramPersistState.version) {
        throw errorWithData(
          "No version found in file, cannot migrate old state",
          diagramPersistState,
        );
      }
      const migratedDiagramState = migrate(
        diagramPersistState.state,
        diagramPersistState.version,
      ) as DiagramStoreState;

      const topicPersistState = downloadJson.topic;
      if (!topicPersistState.version) {
        throw errorWithData(
          "No version found in file, cannot migrate old state",
          topicPersistState,
        );
      }
      const migratedTopicState = migrateTopic(
        topicPersistState.state,
        topicPersistState.version,
      ) as TopicStoreState;

      const viewsPersistState = downloadJson.views;
      if (!viewsPersistState.version) {
        throw errorWithData(
          "No version found in file, cannot migrate old state",
          viewsPersistState,
        );
      }
      const migratedViewsState = migrateQuickView(
        viewsPersistState.state,
        viewsPersistState.version,
      ) as QuickViewStoreState;

      // avoid conflicts with existing topics
      const { uniqueDiagram, uniqueViews } = ensureUnique(migratedDiagramState, migratedViewsState);

      // populate stores
      setTopicDetails(migratedTopicState.topic.description);
      setDiagramData(uniqueDiagram, sessionUsername);
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
    await loadTopicFromLocalStorage();
    await populateDiagramFromLocalStorage();
    await loadQuickViewsFromLocalStorage();
    await loadView("playground");
    await loadActionConfig("playground");
    await loadMiscTopicConfig("playground");
    await loadCommentsFromLocalStorage();
    await loadDraftsFromLocalStorage();
  } else {
    loadTopicFromApi(diagramData);
    populateDiagramFromApi(diagramData);
    loadQuickViewsFromApi(diagramData.views as unknown as QuickView[]); // unknown cast is awkward but need until the viewState is shared with backend
    await loadView(`${diagramData.creatorName}/${diagramData.title}`);
    await loadActionConfig(`${diagramData.creatorName}/${diagramData.title}`);
    await loadMiscTopicConfig(`${diagramData.creatorName}/${diagramData.title}`);
    loadCommentsFromApi(diagramData.comments);
    await loadDraftsFromLocalStorage(`${diagramData.creatorName}/${diagramData.title}`);
  }

  // load comment from URL
  const urlParams = new URLSearchParams(window.location.search);
  const commentId = urlParams.get("comment");
  if (commentId) viewComment(commentId);
};
