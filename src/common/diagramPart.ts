import { PlaygroundTopic, UserTopic, getLinkToTopic } from "@/common/topic";

/**
 * @param topic can be a playground topic so that we can get URLs on the playground if we want to... not super useful but could be convenient at times
 */
export const getLinkToPart = (
  diagramPartId: string,
  topic: PlaygroundTopic | UserTopic,
  viewTitle?: string,
) => {
  const partUrl = new URL(getLinkToTopic(topic));

  partUrl.searchParams.set("selected", diagramPartId);
  if (viewTitle) partUrl.searchParams.set("view", viewTitle); // set view too so the part can be guaranteed to show in the diagram if that's desired

  return partUrl.href;
};
