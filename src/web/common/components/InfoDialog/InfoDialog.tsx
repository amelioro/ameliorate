import { Close, Error, Info, Warning } from "@mui/icons-material";
import { IconButton, Popper, Typography } from "@mui/material";
import { Mask } from "@reactour/mask";
import { startCase } from "es-toolkit";
import { ReactNode, useEffect, useState } from "react";

import { Anchor, InfoType, emitter } from "@/web/common/components/InfoDialog/infoEvents";

const defaultRect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  // not sure what kind of jank is going on here, but apparently width and height of 0 still create a small highlighted area, and -20 is the minimum to remove the area...
  width: -20,
  height: -20,
  x: 0,
  y: 0,
};

export const InfoDialog = () => {
  const [open, setOpen] = useState(false);
  const [infoType, setInfoType] = useState<InfoType>("info");
  const [message, setMessage] = useState<ReactNode>("");
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // seems a little awkward to rely on an event to set all this state, but what's nice about it is
    // that the state doesn't need to be accessible from outside the component.
    const unbindInfoToShow = emitter.on("infoToShow", (infoType, message, anchor) => {
      setInfoType(infoType);
      setMessage(message);
      setAnchor(anchor ?? null);
      setOpen(true);
    });

    return () => {
      unbindInfoToShow();
    };
  }, []);

  if (!open) return null;

  const anchorEl =
    anchor instanceof HTMLElement
      ? anchor
      : typeof anchor === "string"
        ? document.querySelector(anchor)
        : null;

  const maskSizes = anchorEl ? anchorEl.getBoundingClientRect() : defaultRect;

  const InfoTypeIcon = infoType === "error" ? Error : infoType === "warning" ? Warning : Info;

  return (
    <>
      {/* set opacity to match MUI Backdrop's opacity, bit lighter than reactour's mask's 70%. feels a bit nicer, don't need to create as much emphasis as that. */}
      <Mask sizes={maskSizes} onClick={() => setOpen(false)} className="opacity-50!" />

      <Popper
        open={open}
        anchorEl={anchorEl}
        modifiers={[
          // push Popper down/up by 26px from the anchor
          { name: "offset", options: { offset: [0, 26] } },
          // enable arrow positioning, using our arrowRef
          { name: "arrow", options: { element: arrowRef, padding: 10 } },
        ]}
        // z-index to match the mask's so that Popper is above the mask
        className={
          "z-99999 max-w-[min(80svw,36rem)] rounded-lg bg-white" +
          (anchorEl ? "" : " left-1/2! top-1/2! -translate-x-1/2! -translate-y-1/2!")
        }
        aria-label="Info Dialog"
      >
        {({ placement }) => {
          const isBelow = placement.startsWith("bottom");
          return (
            <>
              {/* functionality to only show the arrow when there's an anchorEl */}
              {anchorEl && (
                <span
                  ref={setArrowRef}
                  data-popper-arrow
                  className={`
                  absolute
                  size-3
                  ${isBelow ? "-top-1.5" : "-bottom-1.5"}
                  before:absolute
                  before:size-3
                  before:content-['']
                  ${isBelow ? "before:bg-paperShaded-main" : "before:bg-white"}
                  before:rotate-45
                `}
                />
              )}

              <div className="flex items-center justify-between rounded-t-lg bg-paperShaded-main px-2 py-1">
                <InfoTypeIcon color={infoType} fontSize="small" />

                <Typography className="font-bold">{startCase(infoType)}</Typography>

                <IconButton
                  size="small"
                  title="Close"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </div>

              <Typography
                variant="body2"
                className="max-h-[70svh] overflow-auto p-2 whitespace-pre-wrap"
              >
                {message}
              </Typography>
            </>
          );
        }}
      </Popper>
    </>
  );
};
