import {
  Article,
  ArticleOutlined,
  ChatBubble,
  ChatBubbleOutline,
  School,
  SchoolOutlined,
  ThumbsUpDown,
  ThumbsUpDownOutlined,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Typography,
  styled,
} from "@mui/material";

import { useCommentCount } from "@/web/comment/store/commentStore";
import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { DetailsBasicsSection } from "@/web/topic/components/TopicPane/DetailsBasicsSection";
import { DetailsJustificationSection } from "@/web/topic/components/TopicPane/DetailsJustificationSection";
import { DetailsResearchSection } from "@/web/topic/components/TopicPane/DetailsResearchSection";
import { useResearchNodes, useTopLevelJustification } from "@/web/topic/store/graphPartHooks";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { useShowResolvedComments } from "@/web/view/miscTopicConfigStore";
import { useExpandDetailsTabs } from "@/web/view/userConfigStore";

export type DetailsTab = "Basics" | "Justification" | "Research" | "Comments";

interface Props {
  graphPart: GraphPart;
  /**
   * This is hoisted to parent so that it's preserved when a part becomes deselected & reselected.
   *
   * - Alternative 1: keep `GraphPartDetails` always rendered; but performance, and `viewTab` event
   * handling would need to move around.
   * - Alternative 2: use a store for this state; but seems like overkill?
   */
  selectedTab: DetailsTab;
  setSelectedTab: (tab: DetailsTab) => void;
}

export const GraphPartDetails = ({ graphPart, selectedTab, setSelectedTab }: Props) => {
  const expandDetailsTabs = useExpandDetailsTabs();

  const partIsNode = isNode(graphPart);

  // Ideally we could exactly reuse the indicator logic here, rather than duplicating, but not sure
  // a good way to do that, so we're just duplicating the logic for now.
  // Don't want to use the exact indicators, because pane indication seems to look better with Icon
  // vs IconOutlined as opposed to background color.
  // Maybe could extract logic from the specific indicators, but that seems also like a decent amount of extra abstraction.
  const { supports, critiques } = useTopLevelJustification(graphPart.id);
  const { questions, facts, sources } = useResearchNodes(graphPart.id);
  const showResolved = useShowResolvedComments();
  const commentCount = useCommentCount(graphPart.id, partIsNode ? "node" : "edge", showResolved);

  const indicateBasics = graphPart.data.notes.length > 0;
  const indicateJustification = [...supports, ...critiques].length > 0;
  const indicateResearch = [...questions, ...facts, ...sources].length > 0;
  const indicateComments = commentCount > 0;

  return (
    // flex & max-h to ensure content takes up no more than full height, allowing inner containers to control scrolling
    <List className="flex max-h-full flex-col py-0">
      <div className="flex flex-col items-center">
        {partIsNode ? (
          // z-index to ensure hanging node indicators don't fall behind the next section's empty background
          <EditableNode node={graphPart} className="z-10" />
        ) : (
          <StandaloneEdge edge={graphPart} />
        )}
      </div>

      {/* mt-2 to match distance from Tabs look to graph part */}
      <Divider className="mb-1 mt-2 shadow" />

      <ContentDiv className="overflow-auto">
        {!expandDetailsTabs ? (
          <>
            <TabContext value={!partIsNode && selectedTab === "Research" ? "Basics" : selectedTab}>
              <TabList
                onChange={(_, value: DetailsTab) => setSelectedTab(value)}
                centered
                className="px-2"
              >
                <Tab
                  icon={indicateBasics ? <Article /> : <ArticleOutlined />}
                  value="Basics"
                  title="Basics"
                  aria-label="Basics"
                />
                <Tab
                  icon={indicateJustification ? <ThumbsUpDown /> : <ThumbsUpDownOutlined />}
                  value="Justification"
                  title="Justification"
                  aria-label="Justification"
                />
                {partIsNode && (
                  <Tab
                    icon={indicateResearch ? <School /> : <SchoolOutlined />}
                    value="Research"
                    title="Research"
                    aria-label="Research"
                  />
                )}
                <Tab
                  icon={indicateComments ? <ChatBubble /> : <ChatBubbleOutline />}
                  value="Comments"
                  title="Comments"
                  aria-label="Comments"
                />
              </TabList>

              <TabPanel value="Basics" className="p-2">
                <ListItem disablePadding={false}>
                  <Typography variant="body1" className="mx-auto">
                    Basics
                  </Typography>
                </ListItem>
                <DetailsBasicsSection graphPart={graphPart} />
              </TabPanel>
              <TabPanel value="Justification" className="p-2">
                <ListItem disablePadding={false}>
                  <Typography variant="body1" className="mx-auto">
                    Justification
                  </Typography>
                </ListItem>
                <DetailsJustificationSection graphPart={graphPart} />
              </TabPanel>
              {partIsNode && (
                <TabPanel value="Research" className="p-2">
                  <ListItem disablePadding={false}>
                    <Typography variant="body1" className="mx-auto">
                      Research
                    </Typography>
                  </ListItem>
                  <DetailsResearchSection node={graphPart} />
                </TabPanel>
              )}
              <TabPanel value="Comments" className="p-2">
                <ListItem disablePadding={false}>
                  <Typography variant="body1" className="mx-auto">
                    Comments
                  </Typography>
                </ListItem>
                <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
              </TabPanel>
            </TabContext>
          </>
        ) : (
          <>
            <ListItem disablePadding={false}>
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Basics" />
            </ListItem>
            <DetailsBasicsSection graphPart={graphPart} />

            <Divider className="my-1" />

            <ListItem disablePadding={false}>
              <ListItemIcon>
                <ThumbsUpDown />
              </ListItemIcon>
              <ListItemText primary="Justification" />
            </ListItem>
            <DetailsJustificationSection graphPart={graphPart} />

            {/* prevent adding research nodes to edges; not 100% sure that we want to restrict this, but if it continues to seem good, this section can accept node instead of graphPart */}
            {partIsNode && (
              <>
                <Divider className="my-1" />

                <ListItem disablePadding={false}>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText primary="Research" />
                </ListItem>
                <DetailsResearchSection node={graphPart} />
              </>
            )}

            <Divider className="my-1" />

            <ListItem disablePadding={false}>
              <ListItemIcon>
                <ChatBubble />
              </ListItemIcon>
              <ListItemText primary="Comments" />
            </ListItem>
            <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
          </>
        )}
      </ContentDiv>
    </List>
  );
};

const ContentDiv = styled("div")``;
