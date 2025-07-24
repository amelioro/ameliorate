import { HelpOutline } from "@mui/icons-material";

/**
 * This is mainly extracted so that it's easy to use the same size and styling everywhere.
 *
 * If it makes sense to change size or styling, we can add additional options here.
 */
export const HelpIcon = () => (
  <HelpOutline
    // don't take up too much space, this is an auxiliary thing
    fontSize="small"
    // don't stand out too much, this is an auxiliary thing
    className="text-gray-400"
  />
);
