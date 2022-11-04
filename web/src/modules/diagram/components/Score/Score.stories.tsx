import { type ComponentMeta, type ComponentStory } from "@storybook/react";

import { Score } from "./Score";

export default { component: Score } as ComponentMeta<typeof Score>;

export const Basic: ComponentStory<typeof Score> = () => <Score />;
