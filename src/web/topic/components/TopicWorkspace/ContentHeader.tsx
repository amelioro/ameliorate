import { QuickViewSelect } from "@/web/topic/components/TopicWorkspace/QuickViewSelect";

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
    <div
      className={
        "hidden max-w-[calc(min(20rem,100%))] self-center p-2 *:bg-paperShaded-main lg:flex" +
        (overlay ? " absolute z-10" : "")
      }
    >
      <QuickViewSelect />
    </div>
  );
};
