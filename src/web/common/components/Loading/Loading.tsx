import { CircleLoader } from "react-spinners";

export const Loading = () => {
  return (
    <div className="m-auto flex" role="progressbar">
      <CircleLoader />
    </div>
  );
};
