import { QuickViewSelect } from "@/web/topic/components/TopicWorkspace/QuickViewSelect";

interface Props {
  className?: string;
}

export const ViewToolbar = ({ className }: Props) => {
  return (
    <div
      className={
        // max-w to keep children from being wide, but also prevent from being wider than screen (e.g. small 320px screen is scrunched without padding on 20rem)
        "max-w-[calc(min(20rem,100%))] flex gap-0.5 items-center p-1.5 [&>div]:bg-paperShaded-main" +
        (className ? ` ${className}` : "")
      }
    >
      <QuickViewSelect />
    </div>
  );
};
