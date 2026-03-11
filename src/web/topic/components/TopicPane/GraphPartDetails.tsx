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
import { Tab, Typography } from "@mui/material";

import { useCommentCount } from "@/web/comment/store/commentStore";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { DetailsBasicsSection } from "@/web/topic/components/TopicPane/DetailsBasicsSection";
import { DetailsJustificationSection } from "@/web/topic/components/TopicPane/DetailsJustificationSection";
import { DetailsResearchSection } from "@/web/topic/components/TopicPane/DetailsResearchSection";
import {
  useResearchNodes,
  useTopLevelJustification,
} from "@/web/topic/diagramStore/graphPartHooks";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { useShowResolvedComments } from "@/web/view/miscTopicConfigStore";
import { useExpandDetailsTabs } from "@/web/view/userConfigStore/store";

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
    <>
      {!expandDetailsTabs ? (
        <>
          <TabContext value={!partIsNode && selectedTab === "Research" ? "Basics" : selectedTab}>
            <TabList onChange={(_, value: DetailsTab) => setSelectedTab(value)} centered>
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

            <TabPanel value="Basics">
              <section className="flex flex-col items-center px-0.5 py-2">
                <Typography variant="h6" component="h2" className="mb-2">
                  Basics
                </Typography>
                <DetailsBasicsSection graphPart={graphPart} />
              </section>
            </TabPanel>
            <TabPanel value="Justification">
              <section className="flex flex-col items-center px-0.5 py-2">
                <Typography variant="h6" component="h2" className="mb-2">
                  Justification
                </Typography>
                <DetailsJustificationSection graphPart={graphPart} />
              </section>
            </TabPanel>
            {partIsNode && (
              <TabPanel value="Research">
                <section className="flex flex-col items-center px-0.5 py-2">
                  <Typography variant="h6" component="h2" className="mb-2">
                    Research
                  </Typography>
                  <DetailsResearchSection node={graphPart} />
                </section>
              </TabPanel>
            )}
            <TabPanel value="Comments">
              <section className="flex flex-col items-center p-2">
                <Typography variant="h6" component="h2" className="mb-2">
                  Comments
                </Typography>
                <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
              </section>
            </TabPanel>
          </TabContext>
        </>
      ) : (
        <>
          {/* Sections use px-0.5 instead of px-2 so that two nodes can fit side-by-side if there's a vertical scrollbar. */}
          {/* So for sections with nodes, subsections need to manage padding themselves if they need it, e.g. for Notes */}
          <section className="flex flex-col items-center border-b px-0.5 py-2">
            <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
              <Article /> Basics
            </Typography>
            <DetailsBasicsSection graphPart={graphPart} />
          </section>

          <section className="flex flex-col items-center border-b px-0.5 py-2">
            <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
              <ThumbsUpDown /> Justification
            </Typography>
            <DetailsJustificationSection graphPart={graphPart} />
          </section>

          {/* prevent adding research nodes to edges; not 100% sure that we want to restrict this, but if it continues to seem good, this section can accept node instead of graphPart */}
          {partIsNode && (
            <section className="flex flex-col items-center border-b px-0.5 py-2">
              <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
                <School /> Research
              </Typography>
              <DetailsResearchSection node={graphPart} />
            </section>
          )}

          <section className="flex flex-col items-center p-2">
            <Typography variant="h6" component="h2" className="mb-2 flex items-center gap-2.5">
              <ChatBubble /> Comments
            </Typography>
            <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
          </section>
        </>
      )}
    </>
  );
};
