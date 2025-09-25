import { ExpandLess, ExpandMore, Schema, TableChart, ViewCarousel } from "@mui/icons-material";
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

import { QuickViewSection } from "@/web/topic/components/TopicPane/QuickViewSection";
import { GeneralFilters } from "@/web/view/components/Filter/GeneralFilters";
import { InformationFilters } from "@/web/view/components/Filter/InformationFilters";
import { TableFilters } from "@/web/view/components/Filter/TableFilters";
import { setFormat, useFormat } from "@/web/view/currentViewStore/store";

export const TopicViews = () => {
  const [isFormatSectionOpen, setIsFormatSectionOpen] = useState(false);
  const [isTableFiltersSectionOpen, setIsTableFiltersSectionOpen] = useState(false);
  const [isInformationFiltersSectionOpen, setIsInformationFiltersSectionOpen] = useState(false);
  const [isGeneralFiltersSectionOpen, setIsGeneralFiltersSectionOpen] = useState(false);

  const format = useFormat();

  return (
    <>
      <List>
        <QuickViewSection />

        <Divider sx={{ marginY: 1 }} />

        <ListItem key="1">
          <ListItemButton onClick={() => setIsFormatSectionOpen(!isFormatSectionOpen)}>
            <ListItemText primary="Format" primaryTypographyProps={{ fontWeight: "bold" }} />
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
          <ListItem key="7">
            <ListItemButton selected={format === "summary"} onClick={() => setFormat("summary")}>
              <ListItemIcon>
                <ViewCarousel />
              </ListItemIcon>
              <ListItemText primary="Summary" />
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
                <ListItemText
                  primary="Information Filters"
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
                {isInformationFiltersSectionOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isInformationFiltersSectionOpen} timeout="auto" unmountOnExit>
              <InformationFilters />
            </Collapse>

            <Divider sx={{ marginY: 1 }} />
          </>
        )}

        {format === "table" && (
          <>
            <ListItem key="5">
              <ListItemButton
                onClick={() => setIsTableFiltersSectionOpen(!isTableFiltersSectionOpen)}
              >
                <ListItemText
                  primary="Table Filters"
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
                {isTableFiltersSectionOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isTableFiltersSectionOpen} timeout="auto" unmountOnExit>
              <TableFilters />
            </Collapse>

            <Divider sx={{ marginY: 1 }} />
          </>
        )}

        <ListItem key="6">
          <ListItemButton
            onClick={() => setIsGeneralFiltersSectionOpen(!isGeneralFiltersSectionOpen)}
          >
            <ListItemText
              primary="General Filters"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
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
