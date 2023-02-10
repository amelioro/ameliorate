import { useNode } from "../../store/nodeHooks";
import { problemDiagramId } from "../../store/store";

interface Props {
  problemNodeId: string;
}

export const CriteriaTable = ({ problemNodeId }: Props) => {
  const problemNode = useNode(problemNodeId, problemDiagramId);
  if (!problemNode) return <p>loading...</p>;

  return <p>table here! problem text: {problemNode.data.label}</p>;
};
