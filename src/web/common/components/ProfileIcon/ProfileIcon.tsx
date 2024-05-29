import { Avatar } from "@mui/material";

const stringToColor = (string: string) => {
  /* eslint-disable no-bitwise, functional/no-let, functional/no-loop-statements -- copied implementation from https://mui.com/material-ui/react-avatar/#letter-avatars */
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise, functional/no-let, functional/no-loop-statements */

  return color;
};

interface Props {
  username: string;
}

export const ProfileIcon = ({ username }: Props) => {
  const usernameFirstChar = username[0]?.toUpperCase();
  if (!usernameFirstChar) throw new Error("Username must have at least one character");

  return (
    <Avatar className="size-8" sx={{ bgcolor: stringToColor(username) }}>
      {usernameFirstChar}
    </Avatar>
  );
};
