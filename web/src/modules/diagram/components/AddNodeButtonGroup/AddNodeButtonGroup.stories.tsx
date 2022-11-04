import { type ComponentMeta, type ComponentStory } from "@storybook/react";

import { AddNodeButtonGroup } from "./AddNodeButtonGroup";

export default { component: AddNodeButtonGroup } as ComponentMeta<typeof AddNodeButtonGroup>;

export const Basic: ComponentStory<typeof AddNodeButtonGroup> = () => {
  return <AddNodeButtonGroup nodeId="1" as="Child" />;
};
