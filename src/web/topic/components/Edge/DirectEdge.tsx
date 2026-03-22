import { Typography } from "@mui/material";
import { lowerCase } from "es-toolkit";

import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { Edge } from "@/web/topic/components/Edge/Edge";
import { CommonIndicatorGroup } from "@/web/topic/components/Indicator/Base/CommonIndicatorGroup";
import { ContentIndicatorGroup } from "@/web/topic/components/Indicator/Base/ContentIndicatorGroup";
import { StatusIndicatorGroup } from "@/web/topic/components/Indicator/Base/StatusIndicatorGroup";
import { setCustomEdgeLabel } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { Edge as EdgeData } from "@/web/topic/utils/graph";
import { visibleOnPartHoverSelectedClasses } from "@/web/topic/utils/styleUtils";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { useWhenToShowIndicators } from "@/web/view/userConfigStore/store";

interface Props {
  edge: EdgeData;
  edgeLayoutData: EdgeLayoutData;
  inReactFlow: boolean;
}

export const DirectEdge = ({ edge, edgeLayoutData, inReactFlow }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const unrestrictedEditing = useUnrestrictedEditing();
  const whenToShowIndicators = useWhenToShowIndicators();
  const showIndicatorsOnHoverSelect = whenToShowIndicators === "onHoverOrSelect";

  const labelText = edge.data.customLabel ?? lowerCase(edge.type);

  const labelContentSlot = (
    <>
      <Typography
        variant="body1"
        margin="0"
        contentEditable={userCanEditTopicData && unrestrictedEditing}
        suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
        onBlur={(event) => {
          const text = event.target.textContent.trim();
          if (text && text !== lowerCase(edge.type) && text !== edge.data.customLabel)
            setCustomEdgeLabel(edge, text);
        }}
        className={
          /**
           * - `bg-white`: ensures our label has a background so that paths don't go _through_ the
           * label. note: putting this on the label container itself makes the background bigger
           * than it needs to be, overlapping other labels/paths more often.
           * - `leading-none`: ensures the background is as tight as possible to the text so that it
           * doesn't overlap other labels/paths often. should be ok because edge labels are on a
           * single line, so vertical spacing between other lines isn't relevant.
           */
          "bg-white leading-none" +
          // without nopan, clicking on the span won't let you edit text
          (userCanEditTopicData && unrestrictedEditing ? " nopan" : "")
        }
      >
        {labelText}
      </Typography>
      <CommonIndicatorGroup graphPart={edge} className="absolute right-0 translate-x-5" />
      <div
        className={
          "absolute bottom-0 flex translate-y-5" +
          /**
           * Ideally we only put this on the respective indicator groups, but when we do that, this
           * div still takes up space and is hoverable even when indicators are invisible.
           * Not sure how to avoid that without putting this here (`:empty` doesn't work because the
           * children _are_ in the DOM, they just have `visibility: hidden`).
           * Note: EditableNode's hanging indicator div (BottomDiv) is able to take up no space
           * because the children indicator groups are `absolute`ly positioned. We can't do that
           * here because edge labels don't have enough space to put the groups in opposite corners,
           * they have to be next to each other (and not overlap each other).
           */
          (showIndicatorsOnHoverSelect ? ` invisible ${visibleOnPartHoverSelectedClasses}` : "")
        }
      >
        <StatusIndicatorGroup graphPartId={edge.id} bgColor="white" notes={edge.data.notes} />
        <ContentIndicatorGroup
          graphPartId={edge.id}
          graphPartType="edge"
          bgColor="white"
          className="ml-0"
        />
      </div>
    </>
  );

  return (
    <Edge
      edge={edge}
      edgeLayoutData={edgeLayoutData}
      labelContentSlot={labelContentSlot}
      onContextMenu={(event) => openContextMenu(event, { edge })}
      inReactFlow={inReactFlow}
    />
  );
};
