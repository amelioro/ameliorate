import { shallow } from "zustand/shallow";

import { trpc } from "@/web/common/trpc";
import { UserTopic, useTopicStore } from "@/web/topic/store/store";
import { isPlaygroundTopic } from "@/web/topic/store/utils";
import { useReadonlyMode } from "@/web/view/actionConfigStore";

// TODO: for security, this should probably get the session user rather than assume the username is from the session user
export const useUserCanEditTopicData = (username?: string) => {
  const storeTopic = useTopicStore((state) => state.topic, shallow);
  const readonlyMode = useReadonlyMode();

  const findTopic = trpc.topic.findByUsernameAndTitle.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null id, and if there's an id, it's a UserTopic
    { username: (storeTopic as UserTopic).creatorName, title: (storeTopic as UserTopic).title },
    { enabled: storeTopic.id !== undefined },
  );

  if (readonlyMode) return false;
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
