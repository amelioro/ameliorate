import { MenuItem, TextField } from "@mui/material";

import { selectView, useQuickViews, useSelectedViewId } from "@/web/view/quickViewStore/store";

interface Props {
  openDirection: "top" | "bottom";
}

export const QuickViewSelect = ({ openDirection }: Props) => {
  const quickViews = useQuickViews();
  const selectedViewId = useSelectedViewId();

  return (
    <TextField
      select
      label="Quick View"
      value={selectedViewId ?? "no-view-selected"}
      onChange={(event) => selectView(event.target.value)}
      // jank to manually specify these, but the label should be reduced in size since the Select's text is reduced
      InputLabelProps={{ className: "text-sm translate-x-[1.0625rem] -translate-y-2 scale-75" }}
      SelectProps={{
        // override to be smaller than MUI allows
        SelectDisplayProps: { className: "text-sm py-1" },
        MenuProps: {
          anchorOrigin: {
            vertical: openDirection === "top" ? "top" : "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: openDirection === "top" ? "bottom" : "top",
            horizontal: "left",
          },
        },
      }}
      // ensure no overflow if view titles are really  long
      className="max-w-full"
    >
      {/* e.g. if user manually changes a filter */}
      <MenuItem key="no-view-selected" value="no-view-selected" hidden>
        Custom
      </MenuItem>

      {quickViews.map((view, index) => (
        <MenuItem key={view.id} value={view.id} className="text-sm">
          {index + 1}. {view.title}
        </MenuItem>
      ))}
    </TextField>
  );
};
