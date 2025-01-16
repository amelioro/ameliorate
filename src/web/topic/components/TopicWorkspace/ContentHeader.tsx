import { Settings } from "@mui/icons-material";
import { Dialog, IconButton } from "@mui/material";
import { useState } from "react";

import { Link } from "@/web/common/components/Link";
import { useSessionUser } from "@/web/common/hooks";
import { EditTopicForm } from "@/web/topic/components/TopicForm/TopicForm";
import { QuickViewSelect } from "@/web/topic/components/TopicWorkspace/QuickViewSelect";
import { useTopic } from "@/web/topic/store/topicHooks";
import { useUserIsCreator } from "@/web/topic/store/userHooks";

interface Props {
  /**
   * True if footer should overlay on top of content, false if it should be in-line.
   *
   * Generally is true for diagram since diagram can be moved around the overlay if it's in the way,
   * otherwise false e.g. for table since that can't be moved if the overlay is in the way.
   */
  overlay: boolean;
}

export const ContentHeader = ({ overlay }: Props) => {
  const { sessionUser } = useSessionUser();
  const userIsCreator = useUserIsCreator(sessionUser?.username);

  const topic = useTopic();
  const onPlayground = topic.id === undefined;
  const showSettings = !onPlayground && sessionUser && userIsCreator;

  const [topicFormOpen, setTopicFormOpen] = useState(false);

  return (
    <div
      className={
        // max-w to keep children from being wide, but also prevent from being wider than screen (e.g. small 320px screen is scrunched without padding on 20rem)
        "inset-x-0 flex flex-col items-center p-2 text-sm *:max-w-[calc(min(20rem,100%))] gap-1.5" +
        (overlay
          ? " absolute pointer-events-none *:pointer-events-auto z-10"
          : " bg-paperShaded-main border-b")
      }
    >
      {/* Max-w on individual children so that topic title can take up more space than creator's name, */}
      {/* since it usually will be longer, yet keep creator name from being scrunched if it's already short but topic title is really long. */}
      {/* Classes like text-nowrap are for keeping children on one line, because we don't want them taking much vertical space */}
      <div
        className={
          "flex items-center justify-center text-nowrap rounded border bg-paperShaded-main" +
          // settings button has right padding, so exclude right padding if that's showing
          (showSettings ? " pl-2" : " px-2")
        }
      >
        {onPlayground ? (
          "Playground Topic"
        ) : (
          <>
            <Link
              className="max-w-28 overflow-hidden text-ellipsis"
              href={`/${topic.creatorName}`}
              title={topic.creatorName} // allow hovering since it can be truncated
            >
              {topic.creatorName}
            </Link>
            <span className="shrink-0 px-1">/</span>
            <Link
              className="max-w-52 overflow-hidden text-ellipsis"
              href={`/${topic.creatorName}/${topic.title}`}
              title={topic.title} // allow hovering since it can be truncated
            >
              {topic.title}
            </Link>
          </>
        )}

        {showSettings && (
          <>
            <IconButton
              size="small"
              title="Settings"
              aria-label="Settings"
              className="py-0"
              onClick={() => setTopicFormOpen(true)}
            >
              <Settings fontSize="inherit" />
            </IconButton>
            <Dialog
              open={topicFormOpen}
              onClose={() => setTopicFormOpen(false)}
              aria-label="Topic Settings"
            >
              <EditTopicForm topic={topic} creatorName={sessionUser.username} />
            </Dialog>
          </>
        )}
      </div>

      {/* show this in content footer when screens are small and it doesn't fit between AppHeader corners, otherwise put in header */}
      <div className="hidden bg-paperShaded-main lg:block">
        <QuickViewSelect />
      </div>
    </div>
  );
};
