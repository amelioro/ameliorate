import { TextField } from "@mui/material";

import { selectView, useQuickViews, useSelectedViewId } from "@/web/view/quickViewStore/store";

export const QuickViewSelect = () => {
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
        // native select dropdown maybe looks less stylish but it comes with space-to-open/close, up/down-to-change-value, esc to blur, which is really nice
        // TODO: native select also doesn't size based on selected option, would be nice if it did... unfortunately it seems like right now this requires annoying js https://stackoverflow.com/questions/20091481/auto-resizing-the-select-element-according-to-selected-options-width
        native: true,
        // override to be smaller than MUI allows
        className: "text-sm [&_>_select]:py-1 [&_*]:text-ellipsis",
      }}
    >
      {/* e.g. if user manually changes a filter */}
      <option key="no-view-selected" value="no-view-selected" hidden>
        Custom
      </option>

      {quickViews.map((view, index) => (
        <option key={view.id} value={view.id} className="text-sm">
          {index + 1}. {view.title}
        </option>
      ))}
    </TextField>
  );
};
