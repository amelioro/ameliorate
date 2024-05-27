/**
 * Logic related to loading/unloading stores.
 *
 * Intended to be cross-module e.g. load/unload topic store, view store, with intent that `/web/topic`
 * might become a cross-module place for topic-related things (and the current `topic` verbiage as in
 * `TopicStore` can be reworded to something more narrow).
 */

import fileDownload from "js-file-download";
import { z } from "zod";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../common/errorHandling";
import {
  QuickViewStoreState,
  currentVersion as currentViewsVersion,
  getPersistState as getViewsPersistState,
  initialStateWithBasicViews,
  loadQuickViewsFromDownloaded,
} from "../view/quickViewStore/store";
import { migrate } from "./store/migrate";
import { TopicStoreState } from "./store/store";
import { getPersistState, setTopicData } from "./store/utilActions";
import { getTopicTitle } from "./store/utils";

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

      const topicPersistState = downloadJson.topic;
      if (!topicPersistState.version) {
        throw errorWithData(
          "No version found in file, cannot migrate old state",
          topicPersistState
        );
      }
      const migratedState = migrate(
        topicPersistState.state,
        topicPersistState.version
      ) as TopicStoreState;
      setTopicData(migratedState, sessionUsername);

      const viewsPersistState = downloadJson.views;
      loadQuickViewsFromDownloaded(viewsPersistState.state); // TODO: migrate when quick views have migrations
    })
    .catch((error: unknown) => {
      throw error;
    });
};
