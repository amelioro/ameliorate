import { Autocomplete, TextField } from "@mui/material";

import { useSessionUser } from "../../../common/hooks";
import { useScoringUsernames } from "../../../topic/store/scoreHooks";
import { setPerspectives, usePerspectives } from "../../perspectiveStore";

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
      multiple
      disableCloseOnSelect
      limitTags={10} // there's a ton of space in the drawer, so limiting isn't super necessary
      options={usernameOptions}
      value={perspectives}
      onChange={(_event, value) => setPerspectives([...value])} // hmm need to spread because value is readonly and our params would have to be readonly all the way up the chain for ts to accept it
      renderInput={(params) => <TextField {...params} color="secondary" label="Perspectives" />}
      size="small"
      sx={{ width: "100%" }}
    />
  );
};
