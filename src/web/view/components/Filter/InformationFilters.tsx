import { AutoStories, School, ThumbsUpDown } from "@mui/icons-material";
import { FormControlLabel, Switch as MuiSwitch, Stack, Typography } from "@mui/material";

import { setShowInformation, useDiagramFilter } from "../../currentViewStore/filter";
import { StandardFilter } from "./StandardFilter";

export const InformationFilters = () => {
  const diagramFilter = useDiagramFilter();

  return (
    // TODO: extract Switch component from FormSwitch
    <Stack spacing={1} paddingX={1}>
      <FormControlLabel
        label={
          <Stack direction="row" spacing={0.5}>
            <Typography>Structure</Typography>
            <AutoStories />
          </Stack>
        }
        control={
          <MuiSwitch
            checked={diagramFilter.structure.show}
            onChange={(_event, checked) => setShowInformation("structure", checked)}
          />
        }
      />
      {diagramFilter.structure.show && (
        <StandardFilter infoCategory="structure" filter={diagramFilter.structure} />
      )}

      <FormControlLabel
        label={
          <Stack direction="row" spacing={0.5}>
            <Typography>Research</Typography>
            <School />
          </Stack>
        }
        control={
          <MuiSwitch
            checked={diagramFilter.research.show}
            onChange={(_event, checked) => setShowInformation("research", checked)}
          />
        }
      />
      {diagramFilter.research.show && (
        <StandardFilter infoCategory="research" filter={diagramFilter.research} />
      )}

      <FormControlLabel
        label={
          <Stack direction="row" spacing={0.5}>
            <Typography>Justification</Typography>
            <ThumbsUpDown />
          </Stack>
        }
        control={
          <MuiSwitch
            checked={diagramFilter.justification.show}
            onChange={(_event, checked) => setShowInformation("justification", checked)}
          />
        }
      />
      {diagramFilter.justification.show && (
        <StandardFilter infoCategory="justification" filter={diagramFilter.justification} />
      )}
    </Stack>
  );
};
