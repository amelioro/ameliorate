import * as Popover from "@radix-ui/react-popover";

import { LinkEditorPanel } from "../../../panels";
import { Icon } from "../../../ui/Icon";
import { Toolbar } from "../../../ui/Toolbar";

export interface EditLinkPopoverProps {
  onSetLink: (link: string) => void;
}

export const EditLinkPopover = ({ onSetLink }: EditLinkPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Toolbar.Button tooltip="Set Link">
          <Icon name="Link" />
        </Toolbar.Button>
      </Popover.Trigger>
      <Popover.Content>
        <LinkEditorPanel onSetLink={onSetLink} />
      </Popover.Content>
    </Popover.Root>
  );
};
