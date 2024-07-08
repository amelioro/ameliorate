import { ExpandLess, ExpandMore, Schema, TableChart } from "@mui/icons-material";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { QuickViewSection } from "@/web/topic/components/TopicPane/QuickViewSection";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { GeneralFilters } from "@/web/view/components/Filter/GeneralFilters";
import { InformationFilters } from "@/web/view/components/Filter/InformationFilters";
import { TableFilters } from "@/web/view/components/Filter/TableFilters";
import { setFormat, useFormat } from "@/web/view/currentViewStore/store";

export const TopicViews = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopic = useUserCanEditTopicData(sessionUser?.username);

  const [isFormatSectionOpen, setIsFormatSectionOpen] = useState(userCanEditTopic);
  const [isTableFiltersSectionOpen, setIsTableFiltersSectionOpen] = useState(userCanEditTopic);
  const [isInformationFiltersSectionOpen, setIsInformationFiltersSectionOpen] =
    useState(userCanEditTopic);
  const [isGeneralFiltersSectionOpen, setIsGeneralFiltersSectionOpen] = useState(false);

  const format = useFormat();

  return (
    <>
      <List>
        <QuickViewSection />

        <Divider sx={{ marginY: 1 }} />

        <ListItem key="1">
          <ListItemButton onClick={() => setIsFormatSectionOpen(!isFormatSectionOpen)}>
            <ListItemText primary="Format" />
            {isFormatSectionOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={isFormatSectionOpen} timeout="auto" unmountOnExit>
          <ListItem key="2">
            <ListItemButton selected={format === "diagram"} onClick={() => setFormat("diagram")}>
              <ListItemIcon>
                <Schema />
              </ListItemIcon>
              <ListItemText primary="Diagram" />
            </ListItemButton>
          </ListItem>
          <ListItem key="3">
            <ListItemButton selected={format === "table"} onClick={() => setFormat("table")}>
              <ListItemIcon>
                <TableChart />
              </ListItemIcon>
              <ListItemText primary="Tradeoffs Table" />
            </ListItemButton>
          </ListItem>
        </Collapse>

        <Divider sx={{ marginY: 1 }} />

        {format === "diagram" && (
          <>
            <ListItem key="4">
              <ListItemButton
                onClick={() => setIsInformationFiltersSectionOpen(!isInformationFiltersSectionOpen)}
              >
                <ListItemText primary="Information Filters" />
                {isInformationFiltersSectionOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isInformationFiltersSectionOpen} timeout="auto" unmountOnExit>
              <InformationFilters />
            </Collapse>
          </>
        )}

        {format === "table" && (
          <>
            <ListItem key="5">
              <ListItemButton
                onClick={() => setIsTableFiltersSectionOpen(!isTableFiltersSectionOpen)}
              >
                <ListItemText primary="Table Filters" />
                {isTableFiltersSectionOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isTableFiltersSectionOpen} timeout="auto" unmountOnExit>
              <TableFilters />
            </Collapse>
          </>
        )}

        <Divider sx={{ marginY: 1 }} />

        <ListItem key="6">
          <ListItemButton
            onClick={() => setIsGeneralFiltersSectionOpen(!isGeneralFiltersSectionOpen)}
          >
            <ListItemText primary="General Filters" />
            {isGeneralFiltersSectionOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={isGeneralFiltersSectionOpen} timeout="auto" unmountOnExit>
          <GeneralFilters />
        </Collapse>
      </List>
    </>
  );
};
