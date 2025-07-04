import { Schema, ViewCarousel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { QuickViewSelect } from "@/web/topic/components/TopicWorkspace/QuickViewSelect";
import { setFormat, useFormat } from "@/web/view/currentViewStore/store";

interface Props {
  /**
   * True if this toolbar is overlaying on top of content, false otherwise.
   *
   * E.g. this controls if the toolbar adds its own background and border.
   */
  overlay: boolean;
  position: "top" | "bottom";
}

export const ViewToolbar = ({ overlay, position }: Props) => {
  const format = useFormat();

  return (
    <div
      className={
        // Pointer-events-none with child -auto so that bg can be full-width colored when not overlaying,
        // but also can be clicked through when it _is_ overlaying.
        // Ideally the width would probably just be the child width when overlaying, rather than
        // relying on pointer-events, but the percentage in `max-w-[min(20rem,100%)]` on the child
        // seems to result in this parent container being wider than that (when the child has a too-long dropdown option).
        "w-full flex justify-center pointer-events-none *:pointer-events-auto" +
        (overlay
          ? " absolute z-10" + (position === "top" ? " top-0" : " bottom-[41px]") // 41px hack to overlay the workspace content above the main toolbar (41px is height of the main toolbar with its border)
          : " bg-paperShaded-main" + (position === "top" ? " border-b" : " border-t"))
      }
    >
      <div
        className={
          // max-w to keep children from being wide, but also prevent from being wider than screen (e.g. small 320px screen is scrunched without padding on 20rem)
          "flex max-w-[min(20rem,100%)] items-center gap-0.5 p-1.5 [&>div]:bg-paperShaded-main"
        }
      >
        {format === "diagram" && (
          <IconButton
            color="primary"
            title="View summary"
            aria-label="View summary"
            onClick={() => setFormat("summary")}
            className="p-1"
          >
            <ViewCarousel />
          </IconButton>
        )}
        {(format === "table" || format == "summary") && (
          <IconButton
            color="primary"
            title="View diagram"
            aria-label="View diagram"
            onClick={() => setFormat("diagram")}
            className="p-1"
          >
            <Schema />
          </IconButton>
        )}

        <QuickViewSelect />
      </div>
    </div>
  );
};
