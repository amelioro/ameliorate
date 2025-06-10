import { NestedMenuItem as MuiNestedMenuItem, NestedMenuItemProps } from "mui-nested-menu";

export const NestedMenuItem = ({ className, children, ...restProps }: NestedMenuItemProps) => {
  return (
    <MuiNestedMenuItem
      {...restProps}
      className={
        // match default mui menu padding and size
        "px-[16px] [&_p]:px-0 [&_p]:text-sm" + (className ? ` ${className}` : "")
      }
    >
      {children}
    </MuiNestedMenuItem>
  );
};
