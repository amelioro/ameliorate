import { type Meta, type StoryFn } from "@storybook/react";

import { AddNodeButtonGroup } from "./AddNodeButtonGroup";

export default { component: AddNodeButtonGroup } as Meta<typeof AddNodeButtonGroup>;

export const Basic: StoryFn<typeof AddNodeButtonGroup> = () => {
  return <AddNodeButtonGroup nodeId="1" as="Child" />;
};
