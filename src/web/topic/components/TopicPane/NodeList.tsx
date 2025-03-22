import { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

export const NodeList = ({ className, children }: Props) => {
  return (
    <div className={`${className} flex flex-wrap items-stretch justify-center gap-0.5`}>
      {children}
    </div>
  );
};
