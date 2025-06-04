import { shallow } from "zustand/shallow";

import { useTopicStore } from "@/web/topic/diagramStore/store";
import { isPlaygroundTopic } from "@/web/topic/diagramStore/utils";
import { useReadonlyMode } from "@/web/view/actionConfigStore";

// TODO: for security, this should probably get the session user rather than assume the username is from the session user
export const useUserCanEditTopicData = (username?: string) => {
  const storeTopic = useTopicStore((state) => state.topic, shallow);
  const readonlyMode = useReadonlyMode();

  if (readonlyMode) return false;
  if (isPlaygroundTopic(storeTopic)) return true;
  if (!username) return false;
  if (storeTopic.creatorName === username) return true;

  return storeTopic.allowAnyoneToEdit;
};

export const useUserIsCreator = (username?: string) => {
  return useTopicStore((state) => {
    if (isPlaygroundTopic(state.topic)) return true;
    if (!username) return false;

    return state.topic.creatorName === username;
  });
};
