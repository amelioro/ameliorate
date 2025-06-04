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
      <Mask sizes={maskSizes} onClick={() => setOpen(false)} className="!opacity-50" />

      <Popper
        open={open}
        anchorEl={anchorEl}
        modifiers={[
          { name: "offset", options: { offset: [0, 24] } },
          { name: "arrow", enabled: !!anchorEl, options: { element: arrowRef } },
        ]}
        className={
          "z-[99999] max-w-[min(80svw,36rem)] " +
          (anchorEl ? "" : " !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2")
        }
        aria-label="Info Dialog"
      >
        {anchorEl && (
          <div
            ref={setArrowRef}
            data-popper-arrow
            className="absolute top-[-20px]"
            style={{
              width: 15,
              height: 20,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid white",
            }}
          />
        )}
        <div className="relative rounded-lg bg-white shadow-lg">
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
            className="max-h-[70svh] overflow-auto whitespace-pre-wrap p-2"
          >
            {message}
          </Typography>
        </div>
      </Popper>
    </>
  );
};
