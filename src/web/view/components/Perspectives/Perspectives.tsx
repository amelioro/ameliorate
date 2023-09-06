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
      options={usernameOptions}
      value={perspectives.length === 1 ? perspectives[0] : null} // TODO: this should accept an array
      onChange={(_event, value) => setPerspectives(value ? [value] : [])}
      renderInput={(params) => <TextField {...params} color="secondary" label="Perspectives" />}
      size="small"
      sx={{ width: 300 }}
    />
  );
};
