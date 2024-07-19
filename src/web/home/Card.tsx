import { Typography } from "@mui/material";

interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Card = ({ title, description, onClick, selected = false }: CardProps) => {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border bg-inherit p-4 transition-all  ${
        onClick
          ? "cursor-pointer border-transparent hover:border-gray-300 hover:bg-primary-main/10 [&.selected]:border-primary-main [&.selected]:bg-primary-main/10"
          : "border-primary-main"
      } ${selected ? "selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Typography variant="h5">{title}</Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </div>
  );
};
