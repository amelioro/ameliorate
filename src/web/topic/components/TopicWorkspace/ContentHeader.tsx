import { ViewToolbar } from "@/web/topic/components/TopicWorkspace/ViewToolbar";

interface Props {
  /**
   * True if footer should overlay on top of content, false if it should be in-line.
   *
   * Generally is true for diagram since diagram can be moved around the overlay if it's in the way,
   * otherwise false e.g. for table since that can't be moved if the overlay is in the way.
   */
  overlay: boolean;
}

export const ContentHeader = ({ overlay }: Props) => {
  return (
    <ViewToolbar className={"hidden self-center lg:flex" + (overlay ? " absolute z-10" : "")} />
  );
};
