import styled from "@emotion/styled";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Article,
  ArticleOutlined,
  ChatBubble,
  ChatBubbleOutline,
  Info,
  Settings,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Dialog, IconButton, MenuItem, Tab, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema } from "@/common/topic";
import { WatchType, watchTypes } from "@/common/watch";
import { useCommentCount } from "@/web/comment/store/commentStore";
import { Link } from "@/web/common/components/Link";
import { useSessionUser } from "@/web/common/hooks";
import { trpc } from "@/web/common/trpc";
import { EditTopicForm } from "@/web/topic/components/TopicForm/TopicForm";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { StoreTopic } from "@/web/topic/store/store";
import { setTopicDetails } from "@/web/topic/store/topicActions";
import { useTopic } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData, useUserIsCreator } from "@/web/topic/store/userHooks";
import { useShowResolvedComments } from "@/web/view/miscTopicConfigStore";
import { useExpandDetailsTabs } from "@/web/view/userConfigStore";

const formSchema = () => {
  return z.object({
    description: topicSchema.shape.description,
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

const BasicsSection = ({ topic }: { topic: StoreTopic }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema()),
    defaultValues: {
      description: topic.description,
    },
  });

  useEffect(() => {
    // when notes changes from outside of form (e.g. undo/redo), make sure form is updated
    reset({ description: topic.description });
  }, [topic.description, reset]);

  return (
    <form
      onBlur={(event) => {
        void handleSubmit((data) => {
          if (topic.description === data.description) return;
          setTopicDetails(data.description);
        })(event);
      }}
      className="w-full"
    >
      <TextField
        {...register("description")}
        label="Description"
        error={!!errors.description}
        helperText={errors.description?.message}
        multiline
        fullWidth
        size="small"
        InputProps={{ className: "text-sm", readOnly: !userCanEditTopicData }}
        InputLabelProps={{ className: "text-sm" }}
        maxRows={10}
      />
    </form>
  );
};

export type DetailsTab = "Basics" | "Comments";

interface Props {
  /**
   * This is hoisted to parent so that it's preserved when a part becomes deselected & reselected.
   *
   * - Alternative 1: keep `TopicDetails` always rendered; but performance.
   * - Alternative 2: use a store for this state; but seems like overkill?
   */
  selectedTab: DetailsTab;
  setSelectedTab: (tab: DetailsTab) => void;
}

export const TopicDetails = ({ selectedTab, setSelectedTab }: Props) => {
  const { sessionUser } = useSessionUser();
  const userIsCreator = useUserIsCreator(sessionUser?.username);

  const topic = useTopic();
  const isPlaygroundTopic = topic.id === undefined;
  const expandDetailsTabs = useExpandDetailsTabs();

  const [topicFormOpen, setTopicFormOpen] = useState(false);

  // Ideally we could exactly reuse the indicator logic here, rather than duplicating, but not sure
  // a good way to do that, so we're just duplicating the logic for now.
  // Don't want to use the exact indicators, because pane indication seems to look better with Icon
  // vs IconOutlined as opposed to background color.
  // Maybe could extract logic from the specific indicators, but that seems also like a decent amount of extra abstraction.
  const showResolved = useShowResolvedComments();
  const commentCount = useCommentCount(null, "topic", showResolved);

  const indicateBasics = topic.description.length > 0;
  const indicateComments = commentCount > 0;

  const willShowWatch = !isPlaygroundTopic && !!sessionUser;
  const findWatch = trpc.watch.find.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- non-playground topics will have an id
    { topicId: topic.id! },
    { enabled: willShowWatch },
  );
  const setWatch = trpc.watch.setWatch.useMutation({
    onSuccess: () => findWatch.refetch(),
  });
  const showWatch = willShowWatch && findWatch.isSuccess;

  return (
    // min-h-0 to ensure content can shrink within parent flex container, allowing inner containers to control scrolling https://stackoverflow.com/a/66689926/8409296
    // grow so that it can take up the full pane's space and not overflow if a node is at the bottom and has an indicator overhanging
    <div className="flex min-h-0 grow flex-col py-0">
      {/* max-w and wrap/break to handle long topic titles */}
      {/* hardcode shadow to be 1px lower than default tailwind shadow so that no shadow appears above the container */}
      <div className="flex items-center justify-center text-wrap break-all border-b px-4 pb-1 shadow-[0_2px_3px_0_rgba(0,0,0,0.1)]">
        {isPlaygroundTopic ? (
          "Playground Topic"
        ) : (
          <>
            <Link className="max-w-[40%]" href={`/${topic.creatorName}`}>
              {topic.creatorName}
            </Link>
            <span className="px-1">/</span>
            <Link className="max-w-[60%]" href={`/${topic.creatorName}/${topic.title}`}>
              {topic.title}
            </Link>
          </>
        )}

        {!isPlaygroundTopic && sessionUser && userIsCreator && (
          <>
            <IconButton
              size="small"
              title="Settings"
              aria-label="Settings"
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

      <ContentDiv className="grow overflow-auto">
        {showWatch && (
          <>
            <div className="flex items-center gap-2 border-b p-2 pt-3">
              <TextField
                select
                label="Watch"
                value={findWatch.data?.type ?? "participatingOrMentions"}
                fullWidth
                size="small"
                onChange={(event) => {
                  setWatch.mutate({ topicId: topic.id, type: event.target.value as WatchType });
                }}
              >
                {watchTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip
                title={
                  <span>
                    You will receive notifications if you're subscribed to a thread.
                    <br />
                    <br />
                    Your watch determines in which cases you automatically become subscribed to a
                    thread.
                    <br />
                    <br />
                    "participatingOrMentions" will subscribe you when you participate (comment) in a
                    thread (the "mentions" half is not implemented yet).
                    <br />
                    <br />
                    "all" will subscribe you to all new threads.
                    <br />
                    <br />
                    "ignore" will not subscribe you to any new threads.
                  </span>
                }
                enterTouchDelay={0} // allow touch to immediately trigger
                leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
              >
                <IconButton
                  color="info"
                  aria-label="Watch info"
                  sx={{
                    // Don't make it look like clicking will do something, since it won't.
                    // Using a button here is an attempt to make it accessible, since the tooltip will show
                    // on focus.
                    cursor: "default",
                    alignSelf: "center",
                  }}
                >
                  <Info />
                </IconButton>
              </Tooltip>
            </div>
          </>
        )}

        {!expandDetailsTabs ? (
          <>
            <TabContext value={selectedTab}>
              <TabList onChange={(_, value: DetailsTab) => setSelectedTab(value)} centered>
                <Tab
                  icon={indicateBasics ? <Article /> : <ArticleOutlined />}
                  value="Basics"
                  title="Basics"
                  aria-label="Basics"
                />
                <Tab
                  icon={indicateComments ? <ChatBubble /> : <ChatBubbleOutline />}
                  value="Comments"
                  title="Comments"
                  aria-label="Comments"
                />
              </TabList>

              <TabPanel value="Basics">
                <section className="flex flex-col items-center p-2">
                  <Typography variant="h6" component="h2" className="mb-2">
                    Basics
                  </Typography>
                  <BasicsSection topic={topic} />
                </section>
              </TabPanel>
              <TabPanel value="Comments">
                <section className="flex flex-col items-center p-2">
                  <Typography variant="h6" component="h2" className="mb-2">
                    Comments
                  </Typography>
                  <CommentSection parentId={null} parentType="topic" />
                </section>
              </TabPanel>
            </TabContext>
          </>
        ) : (
          <>
            <section className="flex flex-col items-center border-b p-2">
              <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
                <Article /> Basics
              </Typography>
              <BasicsSection topic={topic} />
            </section>

            <section className="flex flex-col items-center p-2">
              <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
                <ChatBubble /> Comments
              </Typography>
              <CommentSection parentId={null} parentType="topic" />
            </section>
          </>
        )}
      </ContentDiv>
    </div>
  );
};

const ContentDiv = styled.div``;
