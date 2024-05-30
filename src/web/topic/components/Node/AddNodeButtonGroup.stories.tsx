import { type Meta, type StoryFn } from "@storybook/react";

import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";

export default { component: AddNodeButtonGroup } as Meta<typeof AddNodeButtonGroup>;

export const Basic: StoryFn<typeof AddNodeButtonGroup> = () => {
  return <AddNodeButtonGroup fromNodeId="1" fromNodeType="problem" as="child" orientation="DOWN" />;
};
