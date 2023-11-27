import { useTopicDiagram } from "../../store/store";
import { Diagram } from "./Diagram";

export const TopicDiagram = () => {
  const diagram = useTopicDiagram();
  return <Diagram {...diagram} />;
};
