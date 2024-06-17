import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { quickViewSchema } from "@/common/view";
import { QuickView, setTitle } from "@/web/view/quickViewStore/store";

interface Props {
  currentView: QuickView;
  quickViews: QuickView[];
  onClose: () => void;
}

const formSchema = (currentView: QuickView, quickViews: QuickView[]) => {
  return z.object({
    title: quickViewSchema.shape.title.refine(
      (title) => {
        if (title === currentView.title) return true;
        return !quickViews.some((view) => view.title === title);
      },
      (_title) => ({ message: "Title must be unique." }),
    ),
  });
};

type FormData = z.infer<ReturnType<typeof formSchema>>;

export const QuickViewForm = ({ currentView, quickViews, onClose }: Props) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema(currentView, quickViews)),
    defaultValues: {
      title: currentView.title,
    },
  });

  return (
    <Dialog
      open={true}
      onClose={onClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: FormEvent<HTMLFormElement>) =>
          void handleSubmit((data) => {
            setTitle(currentView.id, data.title);
            onClose();
          })(event),
      }}
    >
      <DialogTitle>Quick View</DialogTitle>
      <DialogContent>
        <TextField
          {...register("title")}
          label="Title"
          error={!!errors.title}
          helperText={errors.title?.message}
          // for some reason, the top of the text field gets cut off without margin
          // also, set width so that error text doesn't increase the width
          sx={{ marginTop: 1, width: "300px" }}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
};
