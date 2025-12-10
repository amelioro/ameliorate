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

import { rethrowWithData } from "@/common/errorHandling";
import { topicFileSchema } from "@/common/topic";
import {
  loadCommentsFromApi,
  loadCommentsFromLocalStorage,
  viewComment,
} from "@/web/comment/store/commentStore";
import { loadDraftsFromLocalStorage } from "@/web/comment/store/draftStore";
import { setPartIdToCentralize } from "@/web/common/store/ephemeralStore";
import { getGraphPart } from "@/web/topic/diagramStore/graphPartHooks";
import {
  populateDiagramFromApi,
  populateDiagramFromLocalStorage,
} from "@/web/topic/diagramStore/loadActions";
import { migrate as migrateDiagram } from "@/web/topic/diagramStore/migrate";
import { DiagramStoreState, currentDiagramVersion } from "@/web/topic/diagramStore/store";
import {
  getPersistState as getDiagramPersistState,
  setDiagramData,
} from "@/web/topic/diagramStore/utilActions";
import { getTopicTitleFromNodes } from "@/web/topic/diagramStore/utils";
import { migrate as migrateTopic } from "@/web/topic/topicStore/migrate";
import {
  TopicStoreState,
  currentTopicVersion,
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
  currentVersion as currentQuickViewsVersion,
  getPersistState as getViewsPersistState,
  initialStateWithBasicViews,
  loadQuickViewsFromApi,
  loadQuickViewsFromDownloaded,
  loadQuickViewsFromLocalStorage,
} from "@/web/view/quickViewStore/store";
import { setSelected } from "@/web/view/selectedPartStore";

const oldDownloadSchema1 = z
  .object({
    state: z
      .object({
        topic: z.record(z.any()),
      })
      .and(z.record(z.any())),
    version: z.number(),
  })
  .strict(); // strict because we shouldn't have additional properties (in case new properties are the main difference with new schema)

const oldDownloadSchema2 = z
  .object({
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
  })
  .strict(); // strict because we shouldn't have additional properties (in this case schema 3 is only different because `diagram` is added)

const topicFileSkeletonSchema = z.object({
  topic: z.object({
    state: z.record(z.any()),
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
});

type TopicFileSkeletonSchema = z.infer<typeof topicFileSkeletonSchema>;

const parseStoreSkeletons = (input: unknown): TopicFileSkeletonSchema => {
  const parsedSchema1 = oldDownloadSchema1.safeParse(input);
  if (parsedSchema1.success) {
    return {
      topic: { state: { topic: parsedSchema1.data.state.topic }, version: 1 },
      diagram: parsedSchema1.data,
      views: { state: initialStateWithBasicViews(), version: currentQuickViewsVersion },
    };
  }

  const parsedSchema2 = oldDownloadSchema2.safeParse(input);
  if (parsedSchema2.success) {
    return {
      topic: { state: { topic: parsedSchema2.data.topic.state.topic }, version: 1 },
      diagram: parsedSchema2.data.topic,
      views: parsedSchema2.data.views,
    };
  }

  return topicFileSkeletonSchema.parse(input);
};

const topicFileSchemaWithMigrationProcessing = z.preprocess((inputText) => {
  // Parsing the skeleton allows us to manage the file structure separately from the individual store's structures.
  // This way, when we update a store (e.g. changing edge type "obstacleOf" to "impedes"), we can rely
  // on store migrations without needing to update this logic.
  // File structure changes aren't going to be solved via store migrations, so we have those separately
  // managed as zod schemas for each version.
  const storeSkeletons = parseStoreSkeletons(inputText);

  const migratedTopic = migrateTopic(
    storeSkeletons.topic.state,
    storeSkeletons.topic.version,
  ) as unknown;
  const migratedDiagram = migrateDiagram(
    storeSkeletons.diagram.state,
    storeSkeletons.diagram.version,
  ) as unknown;
  const migratedViews = migrateQuickView(
    storeSkeletons.views.state,
    storeSkeletons.views.version,
  ) as unknown;

  const migratedFileData = {
    topic: { state: migratedTopic, version: currentTopicVersion },
    diagram: { state: migratedDiagram, version: currentDiagramVersion },
    views: { state: migratedViews, version: currentQuickViewsVersion },
  };

  return migratedFileData;
}, topicFileSchema);

/**
 * TODO: avoiding using a type built from topicFileSchema is hack to create a type with the exact
 * store structures without us needing to extract those into the zod schemas completely.
 *
 * We _should_ extract the types into the zod schemas completely, but that's more work than I want to
 * do right now.
 *
 * Probably ideally would have xStoreSchema (e.g. diagramStoreSchema) for each store, and each store
 * uses the type from that, then the topicFileSchema could be completely accurate.
 * What's slightly awkward is that files should be able to process on the
 * backend, so we want these schemas in common/. They could also have preprocess logic to run store
 * migrations, but store migrations seem even more awkward to put in common/.
 */
interface TopicFileJson {
  topic: StorageValue<TopicStoreState>;
  diagram: StorageValue<DiagramStoreState>;
  views: StorageValue<QuickViewStoreState>;
}

export const downloadTopic = () => {
  const topicPersistState = getTopicPersistState();
  const diagramPersistState = getDiagramPersistState();
  const viewsPersistState = getViewsPersistState();

  const topic = topicPersistState.state.topic;
  const topicTitle = !isPlaygroundTopic(topic)
    ? topic.title
    : getTopicTitleFromNodes(diagramPersistState.state);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137

  const topicFileJson: TopicFileJson = {
    topic: topicPersistState,
    diagram: diagramPersistState,
    views: viewsPersistState,
  };

  fileDownload(JSON.stringify(topicFileJson), `${sanitizedFileName}.json`);
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
  let stringifiedDiagram = JSON.stringify(diagramStoreState);
  // eslint-disable-next-line functional/no-let
  let stringifiedViews = JSON.stringify(quickViewStoreState);

  [...nodes, ...edges].forEach((graphPart) => {
    const newId = uuid();

    stringifiedDiagram = stringifiedDiagram.replace(new RegExp(graphPart.id, "g"), newId);
    stringifiedViews = stringifiedViews.replace(new RegExp(graphPart.id, "g"), newId);
  });

  views.forEach((view) => {
    const newId = shortUUID.generate();

    // topic shouldn't point to any view ids
    stringifiedViews = stringifiedViews.replace(new RegExp(view.id, "g"), newId);
  });

  return {
    uniqueDiagram: JSON.parse(stringifiedDiagram) as DiagramStoreState,
    uniqueViews: JSON.parse(stringifiedViews) as QuickViewStoreState,
  };
};

export const uploadTopic = async (
  event: React.ChangeEvent<HTMLInputElement>,
  sessionUsername?: string,
) => {
  if (event.target.files === null) return;

  const file = event.target.files[0];
  if (!file) return;

  const fileText = await file.text();

  try {
    const { topic, diagram, views } = topicFileSchemaWithMigrationProcessing.parse(
      JSON.parse(fileText),
    ) as TopicFileJson; // casting is a hack, see comment on TopicFileJson interface

    // avoid conflicts with existing topics
    const { uniqueDiagram, uniqueViews } = ensureUnique(diagram.state, views.state);

    // populate stores
    setTopicDetails(topic.state.topic.description);
    setDiagramData(uniqueDiagram, sessionUsername);
    loadQuickViewsFromDownloaded(uniqueViews);
  } catch (error: unknown) {
    rethrowWithData(error, { fileText });
  }
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

  // process URL params
  const urlParams = new URLSearchParams(window.location.search);

  const selectedId = urlParams.get("selected");
  if (selectedId) {
    const fullPartId = getGraphPart(selectedId)?.id;
    if (fullPartId) {
      setSelected(fullPartId);
      setPartIdToCentralize(fullPartId);
    }
  }

  const commentId = urlParams.get("comment");
  if (commentId) viewComment(commentId);
};
