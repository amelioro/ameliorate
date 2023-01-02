import { type Meta, type StoryFn } from "@storybook/react";

import { ScoreDial } from "./ScoreDial";

export default { component: ScoreDial } as Meta<typeof ScoreDial>;

export const Basic: StoryFn<typeof ScoreDial> = () => (
  <ScoreDial scorableId="1" scorableType="node" score="-" />
);
