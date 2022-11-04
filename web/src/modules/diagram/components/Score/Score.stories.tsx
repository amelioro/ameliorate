import { type Meta, type StoryFn } from "@storybook/react";

import { Score } from "./Score";

export default { component: Score } as Meta<typeof Score>;

export const Basic: StoryFn<typeof Score> = () => <Score />;
