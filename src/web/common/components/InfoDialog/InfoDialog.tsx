import { Close, Error, Info, Warning } from "@mui/icons-material";
import { IconButton, Popper, Typography } from "@mui/material";
import { Mask } from "@reactour/mask";
import { startCase } from "lodash";
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

  useEffect(() => {
    // seems a little awkward to rely on an event to set all this state, but what's nice about it is
    // that the state doesn't need to be accesssible from outside the component.
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
      <Mask sizes={maskSizes} onClick={() => setOpen(false)} className="!opacity-50" />

      <Popper
        open={open}
        anchorEl={anchorEl}
        modifiers={[{ name: "offset", options: { offset: [0, 12] } }]}
        // z-index to match the mask's so that popper is above the mask
        className={
          "z-[99999] max-w-[min(80svw,36rem)] rounded-lg bg-white" +
          (anchorEl ? "" : " !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2")
        }
        aria-label="Info Dialog"
      >
        <div className="flex items-center justify-between rounded-t-lg bg-paperShaded-main px-2 py-1">
          <InfoTypeIcon color={infoType} fontSize="small" />

          <Typography className="font-bold">{startCase(infoType)}</Typography>

          <IconButton size="small" title="Close" aria-label="Close" onClick={() => setOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </div>

        <Typography variant="body2" className="max-h-[70svh] overflow-auto whitespace-pre-wrap p-2">
          {message}
        </Typography>
      </Popper>
    </>
  );
};
