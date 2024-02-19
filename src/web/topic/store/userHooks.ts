import { shallow } from "zustand/shallow";

import { trpc } from "../../common/trpc";
import { useTopicStore } from "./store";
import { isPlaygroundTopic } from "./utils";

// TODO: for security, this should probably get the session user rather than assume the username is from the session user
export const useUserCanEditTopicData = (username?: string) => {
  const storeTopic = useTopicStore((state) => state.topic, shallow);

  const findTopic = trpc.topic.find.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null before query is run
    { id: storeTopic.id! },
    { enabled: storeTopic.id !== undefined, staleTime: Infinity }
  );

  if (isPlaygroundTopic(storeTopic)) return true;
  if (!username) return false;
  if (storeTopic.creatorName === username) return true;
  if (findTopic.isLoading || findTopic.isError || !findTopic.data) return false;

  return findTopic.data.allowAnyoneToEdit;
};

export const useUserIsCreator = (username?: string) => {
  return useTopicStore((state) => {
    if (isPlaygroundTopic(state.topic)) return true;
    if (!username) return false;

    return state.topic.creatorName === username;
  });
};
