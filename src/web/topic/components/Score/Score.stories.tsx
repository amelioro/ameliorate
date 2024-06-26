import { type Meta, type StoryFn } from "@storybook/react";

import { Score } from "@/web/topic/components/Score/Score";

export default { component: Score } as Meta<typeof Score>;

export const Basic: StoryFn<typeof Score> = () => <Score graphPartId="1" />;
