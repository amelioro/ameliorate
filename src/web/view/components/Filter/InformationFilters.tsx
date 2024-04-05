import { AutoStories, School, ThumbsUpDown } from "@mui/icons-material";
import { FormControlLabel, Switch as MuiSwitch, Stack, Typography } from "@mui/material";

import { setShowInformation, useDiagramFilter } from "../../navigateStore";

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
      {/* TODO: conditionally show standard filters */}
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
    </Stack>
  );
};
