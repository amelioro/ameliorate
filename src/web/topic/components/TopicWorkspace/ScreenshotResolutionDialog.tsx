import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from "@mui/material";
import { getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getNodesBounds, getRenderedNodes } from "@/web/topic/components/Diagram/externalFlowStore";
import { defaultFitViewPadding } from "@/web/topic/utils/flowUtils";

const ScreenshotFormSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

type ScreenshotFormData = z.infer<typeof ScreenshotFormSchema>;

const defaultResolution = { width: 2560, height: 1440 };

const onScreenshotSubmit = ({ width, height }: ScreenshotFormData) => {
  // these two functions (jankily?) come from our `externalFlowStore` because otherwise we have to
  // be within the react flow provider's react tree in order to access them (via `useReactFlow`).
  const nodes = getRenderedNodes();
  const bounds = getNodesBounds(nodes);

  // thanks react flow example https://reactflow.dev/examples/misc/download-image
  const viewport = getViewportForBounds(bounds, width, height, 0.125, 2, defaultFitViewPadding);
  const viewportElement = document.querySelector(".react-flow__viewport");
  if (!viewportElement) throw new Error("Couldn't find viewport element to screenshot");

  toPng(viewportElement as HTMLElement, {
    backgroundColor: "#fff",
    width,
    height,
    style: {
      width: width.toString(),
      height: height.toString(),
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  })
    .then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("download", "topic.png");
      a.setAttribute("href", dataUrl);
      a.click();
    })
    .catch((error: unknown) => {
      console.error("Failed to export PNG:", error);
    });
};

interface ScreenshotResolutionDialogProps {
  screenshotDialogOpen: boolean;
  setScreenshotDialogOpen: (isOpen: boolean) => void;
}

export const ScreenshotResolutionDialog = ({
  screenshotDialogOpen,
  setScreenshotDialogOpen,
}: ScreenshotResolutionDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScreenshotFormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: defaultResolution,
    resolver: zodResolver(ScreenshotFormSchema),
  });

  return (
    <Dialog
      open={screenshotDialogOpen}
      onClose={() => setScreenshotDialogOpen(false)}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            void handleSubmit((data) => {
              onScreenshotSubmit(data);
              setScreenshotDialogOpen(false);
            })(event);
          },
        },
      }}
    >
      <DialogTitle>Set Screenshot Resolution</DialogTitle>
      <DialogContent className="flex flex-col">
        <TextField
          label="Width"
          type="number"
          margin="dense"
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">px</InputAdornment> },
          }}
          error={!!errors.width}
          helperText={errors.width?.message}
          {...register("width", { valueAsNumber: true })}
        />
        <TextField
          label="Height"
          type="number"
          margin="dense"
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">px</InputAdornment> },
          }}
          error={!!errors.height}
          helperText={errors.height?.message}
          {...register("height", { valueAsNumber: true })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScreenshotDialogOpen(false)} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};
