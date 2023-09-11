import { Autocomplete, TextField } from "@mui/material";

import { useSessionUser } from "../../../common/hooks";
import { useScoringUsernames } from "../../../topic/store/scoreHooks";
import { setPerspectives, usePerspectives } from "../../store/store";

export const Perspectives = () => {
  const { sessionUser } = useSessionUser();
  const scoringUsernames = useScoringUsernames();
  const perspectives = usePerspectives();

  const usernameOptions =
    sessionUser?.username && !scoringUsernames.includes(sessionUser.username)
      ? scoringUsernames.concat(sessionUser.username)
      : scoringUsernames;

  return (
    <Autocomplete
      multiple={true}
      disableCloseOnSelect={true}
      limitTags={1}
      options={usernameOptions}
      value={perspectives}
      onChange={(_event, value) => setPerspectives(value)}
      renderInput={(params) => <TextField {...params} color="secondary" label="Perspectives" />}
      size="small"
      sx={{
        width: 300,
        // 100% - 4px is what Mui sets, but 5/6 of that (with the input minWidth reduction) seems to
        // ensure that one chip with the "+x" can fit on one line, and therefore the topic toolbar
        // doesn't grow.
        // Notably, the topic toolbar can grow when this component is selected, because the "+x"
        // will expand, but I'm not sure how to get around that.
        "& .MuiChip-root": { maxWidth: "calc((100% - 4px) * 5 / 6)" },
        // Four selectors to override Mui's three selectors.
        // Overriding Mui's 30px min to achieve chip fitting in one line.
        // Doesn't appear to have blatant negative consequences.
        "& .MuiAutocomplete-inputRoot input.MuiAutocomplete-input": { minWidth: "0px" },
      }}
    />
  );
};
